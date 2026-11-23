const request = require('supertest');
const { createApp } = require('../../src/app');
const { createRepository } = require('../../src/repository');

const repo = createRepository(process.env.DATABASE_URL);
const app = createApp(repo);
afterAll(() => repo.close());

test('banco acessível via /health', async () => {
  const r = await request(app).get('/health');
  expect(r.body.db).toBe('up');
});

test('fluxo completo: criar item → pedir → consultar', async () => {
  const item = (await request(app).post('/cardapio')
    .send({ nome: 'Item de Teste', preco: 5.25 })).body;
  expect(item.id).toBeDefined();

  const pedido = await request(app).post('/pedidos')
    .send({ cliente: 'Aluno Teste', itens: [{ item_id: item.id, quantidade: 3 }] });
  expect(pedido.status).toBe(201);
  expect(pedido.body.total).toBe(15.75);

  const busca = await request(app).get(`/pedidos/${pedido.body.id}`);
  expect(busca.body.cliente).toBe('Aluno Teste');
});

test('item inexistente retorna 422 e não cria pedido', async () => {
  const r = await request(app).post('/pedidos')
    .send({ cliente: 'X', itens: [{ item_id: 99999, quantidade: 1 }] });
  expect(r.status).toBe(422);
});
