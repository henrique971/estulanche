const { createApp } = require('./app');
const { createRepository } = require('./repository');

const repo = createRepository(process.env.DATABASE_URL);
const port = process.env.PORT || 3000;
const server = createApp(repo).listen(port, () =>
  console.log(`EstuLanches v${process.env.APP_VERSION || '1.0.0'} ouvindo na porta ${port}`));

process.on('SIGTERM', () => server.close(() => repo.close().then(() => process.exit(0))));
