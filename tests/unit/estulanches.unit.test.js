const request = require('supertest');
const { createApp } = require('../../src/app');
const { validarItem, validarPedido, calcularTotal } = require('../../src/validators');

describe('validators', () => {
  test('item válido não gera erros', () =>
    expect(validarItem({ nome: 'Coxinha', preco: 7 })).toEqual([]));
  test('item com preço negativo é rejeitado', () =>
    expect(validarItem({ nome: 'Coxinha', preco: -1 })).toHaveLength(1));
  test('pedido sem itens é rejeitado', () =>
    expect(validarPedido({ cliente: 'Ana', itens: [] }).length).toBeGreaterThan(0));
  test('calcula total com arredondamento', () =>
    expect(calcularTotal([{ preco: 4.5, quantidade: 2 }, { preco: 7, quantidade: 1 }])).toBe(16));
});

describe('rotas (repositório simulado)', () => {
  const repo = {
    ping: async () => {},
    listarCardapio: async () => [{ id: 1, nome: 'Coxinha', preco: 7 }],
    criarItem: async (i) => ({ id: 9, ...i }),
    criarPedido: async (p) => ({ id: 1, total: 7, status: 'RECEBIDO', cliente: p.cliente }),
    buscarPedido: async (id) => (id === 1 ? { id: 1 } : null),
  };
  const app = createApp(repo);

  test('GET /health', async () => {
    const r = await request(app).get('/health');
    expect(r.status).toBe(200);
  });
  test('GET /cardapio', async () => {
    const r = await request(app).get('/cardapio');
    expect(r.body[0].nome).toBe('Coxinha');
  });
  test('POST /pedidos inválido retorna 400', async () => {
    const r = await request(app).post('/pedidos').send({});
    expect(r.status).toBe(400);
  });
  test('GET /pedidos/999 retorna 404', async () => {
    const r = await request(app).get('/pedidos/999');
    expect(r.status).toBe(404);
  });
});
