const $ = (id) => document.getElementById(id);
const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
let cardapio = [];

function aviso(texto, ok = true) {
  const m = $('msg');
  m.textContent = texto;
  m.className = ok ? 'ok' : 'erro';
  m.style.display = 'block';
}

async function api(url, opts) {
  const r = await fetch(url, opts);
  const d = await r.json();
  if (!r.ok) throw new Error(d.erros ? d.erros.join(', ') : d.erro);
  return d;
}

const post = (url, body) => api(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

function atualizarTotal() {
  const total = [...document.querySelectorAll('.qtd')]
    .reduce((s, i) => s + Number(i.value || 0) * Number(i.dataset.preco), 0);
  $('total').textContent = 'Total: ' + brl(total);
}

async function carregar() {
  cardapio = await api('/cardapio');
  $('cardapio').replaceChildren(...cardapio.map((i) => {
    const item = document.createElement('div');
    item.className = 'item';
    const nome = document.createElement('span');
    nome.textContent = `${i.nome} — ${brl(i.preco)}`;
    const quantidade = document.createElement('input');
    quantidade.className = 'qtd';
    quantidade.type = 'number';
    quantidade.min = '0';
    quantidade.value = '0';
    quantidade.dataset.id = i.id;
    quantidade.dataset.preco = i.preco;
    item.append(nome, quantidade);
    return item;
  }));
  document.querySelectorAll('.qtd').forEach((i) => i.addEventListener('input', atualizarTotal));
  atualizarTotal();
}

$('btnPedir').onclick = async () => {
  const itens = [...document.querySelectorAll('.qtd')]
    .filter((i) => Number(i.value) > 0)
    .map((i) => ({ item_id: Number(i.dataset.id), quantidade: Number(i.value) }));
  try {
    const p = await post('/pedidos', { cliente: $('cliente').value, itens });
    aviso(`Pedido #${p.id} criado! Total: ${brl(p.total)}`);
    $('idPedido').value = p.id;
    carregar();
  } catch (e) { aviso(e.message, false); }
};

$('btnBuscar').onclick = async () => {
  try {
    const p = await api('/pedidos/' + $('idPedido').value);
    $('resultado').textContent = `#${p.id} · ${p.cliente} · ${brl(p.total)} · ${p.status}`;
  } catch (e) { $('resultado').textContent = ''; aviso(e.message, false); }
};

$('btnAdd').onclick = async () => {
  try {
    await post('/cardapio', { nome: $('novoNome').value, preco: Number($('novoPreco').value) });
    $('novoNome').value = $('novoPreco').value = '';
    aviso('Item adicionado!');
    carregar();
  } catch (e) { aviso(e.message, false); }
};

carregar().catch((e) => aviso(e.message, false));
