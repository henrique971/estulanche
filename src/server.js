const { createApp } = require('./app');
const { createRepository, createMemoryRepository } = require('./repository');

const repo = process.env.DATABASE_URL
  ? createRepository(process.env.DATABASE_URL)
  : createMemoryRepository();
const port = process.env.PORT || 3000;
const server = createApp(repo).listen(port, () =>
  console.log(`EstuLanches v${process.env.APP_VERSION || '1.0.0'} ouvindo na porta ${port} (${repo.mode})`));

process.on('SIGTERM', () => server.close(() => repo.close().then(() => process.exit(0))));
