const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { validarItem, validarPedido } = require('./validators');

function createApp(repo) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '10kb' }));
  app.use(rateLimit({ windowMs: 60_000, limit: 300 }));
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.get('/health', async (req, res) => {
    try { await repo.ping(); res.json({ status: 'ok', db: repo.mode === 'memory' ? 'simulado' : 'up' }); }
    catch { res.status(503).json({ status: 'erro', db: 'down' }); }
  });

  app.get('/cardapio', async (req, res) => res.json(await repo.listarCardapio()));

  app.post('/cardapio', async (req, res) => {
    const erros = validarItem(req.body);
    if (erros.length) return res.status(400).json({ erros });
    res.status(201).json(await repo.criarItem(req.body));
  });

  app.post('/pedidos', async (req, res) => {
    const erros = validarPedido(req.body);
    if (erros.length) return res.status(400).json({ erros });
    res.status(201).json(await repo.criarPedido(req.body));
  });

  app.get('/pedidos/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ erro: 'id inválido' });
    const p = await repo.buscarPedido(id);
    if (!p) return res.status(404).json({ erro: 'pedido não encontrado' });
    res.json(p);
  });

  app.use((err, req, res, next) => {
    console.error(err.message);
    const status = err.status || 500;
    res.status(status).json({ erro: status === 500 ? 'Erro interno' : err.message });
  });

  return app;
}

module.exports = { createApp };
