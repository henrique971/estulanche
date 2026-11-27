const { Pool } = require('pg');
const { calcularTotal } = require('./validators');

function createRepository(connectionString) {
  const pool = new Pool({ connectionString, max: 10 });
  return {
    mode: 'postgres',
    async ping() { await pool.query('SELECT 1'); },

    async listarCardapio() {
      const r = await pool.query(
        'SELECT id, nome, preco::float AS preco FROM itens WHERE disponivel ORDER BY nome');
      return r.rows;
    },

    async criarItem({ nome, preco }) {
      const r = await pool.query(
        'INSERT INTO itens(nome, preco) VALUES($1, $2) RETURNING id, nome, preco::float AS preco',
        [nome.trim(), preco]);
      return r.rows[0];
    },

    async criarPedido({ cliente, itens }) {
      const c = await pool.connect();
      try {
        await c.query('BEGIN');
        const ids = itens.map(i => i.item_id);
        const pr = await c.query(
          'SELECT id, preco::float AS preco FROM itens WHERE id = ANY($1) AND disponivel', [ids]);
        const precos = new Map(pr.rows.map(r => [r.id, r.preco]));
        if (ids.some(id => !precos.has(id)))
          throw Object.assign(new Error('Item indisponível ou inexistente'), { status: 422 });
        const linhas = itens.map(i => ({ ...i, preco: precos.get(i.item_id) }));
        const p = await c.query(
          `INSERT INTO pedidos(cliente, total) VALUES($1, $2)
           RETURNING id, cliente, total::float AS total, status`,
          [cliente.trim(), calcularTotal(linhas)]);
        for (const l of linhas) {
          await c.query(
            'INSERT INTO pedido_itens(pedido_id, item_id, quantidade, preco_unit) VALUES($1,$2,$3,$4)',
            [p.rows[0].id, l.item_id, l.quantidade, l.preco]);
        }
        await c.query('COMMIT');
        return p.rows[0];
      } catch (e) {
        await c.query('ROLLBACK');
        throw e;
      } finally {
        c.release();
      }
    },

    async buscarPedido(id) {
      const r = await pool.query(
        'SELECT id, cliente, total::float AS total, status FROM pedidos WHERE id = $1', [id]);
      return r.rows[0] || null;
    },

    close() { return pool.end(); }
  };
}

function createMemoryRepository() {
  const itens = [
    { id: 1, nome: 'Pão de queijo', preco: 4.5 },
    { id: 2, nome: 'Suco de laranja', preco: 6 },
    { id: 3, nome: 'Coxinha', preco: 7 },
    { id: 4, nome: 'Sanduíche natural', preco: 9.5 },
  ];
  const pedidos = [];
  let proximoItemId = itens.length + 1;
  let proximoPedidoId = 1;

  return {
    mode: 'memory',
    async ping() {},

    async listarCardapio() {
      return itens.map((item) => ({ ...item }));
    },

    async criarItem({ nome, preco }) {
      const item = { id: proximoItemId++, nome: nome.trim(), preco };
      itens.push(item);
      return { ...item };
    },

    async criarPedido({ cliente, itens: itensPedido }) {
      const precos = new Map(itens.map((item) => [item.id, item.preco]));
      if (itensPedido.some((item) => !precos.has(item.item_id)))
        throw Object.assign(new Error('Item indisponível ou inexistente'), { status: 422 });

      const linhas = itensPedido.map((item) => ({
        ...item,
        preco: precos.get(item.item_id),
      }));
      const pedido = {
        id: proximoPedidoId++,
        cliente: cliente.trim(),
        total: calcularTotal(linhas),
        status: 'RECEBIDO',
      };
      pedidos.push(pedido);
      return { ...pedido };
    },

    async buscarPedido(id) {
      const pedido = pedidos.find((item) => item.id === id);
      return pedido ? { ...pedido } : null;
    },

    async close() {},
  };
}

module.exports = { createRepository, createMemoryRepository };
