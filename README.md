# EstuLanches

API e interface web de cardápio e pedidos da cantina escolar (Node.js + PostgreSQL + Docker).

Sem `DATABASE_URL`, a aplicação usa um repositório em memória para desenvolvimento local.
Com `DATABASE_URL`, usa PostgreSQL. Os dados em memória são descartados ao encerrar o processo.

## Executar
```bash
cp .env.example .env            
docker compose up -d --build
docker compose ps
docker compose logs db
docker compose logs app
curl localhost:3000/health
curl localhost:3000/
curl localhost:3000/cardapio
curl -X POST localhost:3000/pedidos -H "Content-Type: application/json" \
  -d '{"cliente":"Maria","itens":[{"item_id":1,"quantidade":2}]}'
```

## Testes
```bash
docker compose --profile test run --rm tests                      
docker compose --profile test run --rm tests npm run test:unit
docker compose --profile test run --rm tests npm run test:integration
```
