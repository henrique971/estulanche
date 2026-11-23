function validarItem(b) {
  const e = [];
  if (!b || typeof b.nome !== 'string' || b.nome.trim().length < 2) e.push('nome inválido');
  const p = Number(b?.preco);
  if (!Number.isFinite(p) || p <= 0) e.push('preço deve ser maior que zero');
  return e;
}

function validarPedido(b) {
  const e = [];
  if (!b || typeof b.cliente !== 'string' || !b.cliente.trim()) e.push('cliente obrigatório');
  if (!Array.isArray(b?.itens) || b.itens.length === 0) e.push('itens obrigatórios');
  else b.itens.forEach((i, k) => {
    if (!Number.isInteger(i.item_id) || !Number.isInteger(i.quantidade) || i.quantidade <= 0)
      e.push(`item ${k} inválido`);
  });
  return e;
}

function calcularTotal(linhas) {
  return Math.round(linhas.reduce((s, l) => s + l.preco * l.quantidade, 0) * 100) / 100;
}

module.exports = { validarItem, validarPedido, calcularTotal };
