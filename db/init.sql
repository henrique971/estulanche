CREATE TABLE IF NOT EXISTS itens (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  preco NUMERIC(10,2) NOT NULL CHECK (preco > 0),
  disponivel BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  cliente VARCHAR(100) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'RECEBIDO',
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS pedido_itens (
  pedido_id INT REFERENCES pedidos(id) ON DELETE CASCADE,
  item_id INT REFERENCES itens(id),
  quantidade INT NOT NULL CHECK (quantidade > 0),
  preco_unit NUMERIC(10,2) NOT NULL
);
INSERT INTO itens(nome, preco) VALUES
  ('Pão de queijo', 4.50), ('Suco de laranja', 6.00),
  ('Coxinha', 7.00), ('Sanduíche natural', 9.50);
