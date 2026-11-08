import { ROOTS, BY_ID, CAST_TIME } from './lexicon.js';
import { resolve } from './spells.js';

const $ = id => document.getElementById(id);
const MAX = 100, MANA_REGEN = 8, HP_REGEN = 1.5; // per second

const state = {
  tab: 'S',
  picked: [],
  mana: MAX,
  hp: MAX,
  casting: false,
  grimoire: load(),
};

// ---------- Rendering ----------
function rune(r) {
  const el = document.createElement('div');
  el.className = `rune ${r.role}${r.rare ? ' rare' : ''}`;
  el.innerHTML = `<span>${r.id}</span>`;
  return el;
}

function renderBoard() {
  const board = $('board');
  board.innerHTML = '';
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === state.tab));
  if (state.tab === 'G') return renderGrimoire(board);
  for (const r of ROOTS.filter(r => r.role === state.tab)) {
    const t = document.createElement('button');
    t.className = 'tile' + (state.picked.includes(r.id) ? ' used' : '');
    t.append(rune(r));
    const s = document.createElement('small');
    s.textContent = r.en;
    t.append(s);
    t.onclick = () => pick(r.id);
    board.append(t);
  }
}

function renderGrimoire(board) {
  const entries = Object.values(state.grimoire);
  if (!entries.length) {
    board.innerHTML = '<p class="empty">Spells you cast are recorded here. Hidden combinations are waiting to be discovered.</p>';
    return;
  }
  const wrap = document.createElement('div');
  wrap.className = 'grimoire';
  entries.sort((a, b) => (b.secret - a.secret) || a.name.localeCompare(b.name));
  for (const e of entries) {
    const d = document.createElement('div');
    d.className = 'entry';
    d.innerHTML = `<b>${e.secret ? '★ ' : ''}${e.name}</b><span class="w">${e.words.join(' ')}</span><p>${e.effect}</p>`;
    d.onclick = () => { state.picked = [...e.words]; update(); };
    wrap.append(d);
  }
  const reset = document.createElement('button');
  reset.className = 'reset';
  reset.textContent = 'Reset grimoire';
  reset.onclick = () => {
    if (reset.dataset.armed) { state.grimoire = {}; save(); update(); }
    else { reset.dataset.armed = 1; reset.textContent = 'Tap again to erase every entry'; }
  };
  wrap.append(reset);
  board.append(wrap);
}

function renderSlots() {
  const slots = $('slots');
  slots.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const s = document.createElement('button');
    s.className = 'slot';
    const id = state.picked[i];
    if (id) { s.append(rune(BY_ID[id])); s.onclick = () => unpick(id); }
    slots.append(s);
  }
  $('cast').disabled = !state.picked.length || state.casting;
}

function renderMeters() {
  $('mana').style.width = state.mana + '%';
  $('hp').style.width = state.hp + '%';
  $('manaNum').textContent = Math.floor(state.mana);
  $('hpNum').textContent = Math.floor(state.hp);
}

function showResult(title, sub, { fizzle = false, isNew = false } = {}) {
  const r = $('result');
  r.className = 'result' + (fizzle ? ' fizzle' : '');
  r.innerHTML = (isNew ? '<span class="new">NEW DISCOVERY</span>' : '') +
    `<p class="title"></p><p class="sub"></p>`;
  r.querySelector('.title').textContent = title;
  r.querySelector('.sub').textContent = sub;
}

function update() {
  renderSlots();
  renderBoard();
  renderMeters();
  $('found').textContent = Object.keys(state.grimoire).length;
}

// ---------- Actions ----------
function pick(id) {
  if (state.casting) return;
  if (state.picked.includes(id)) return unpick(id);
  if (state.picked.length >= 3) return showResult('The bar is full', 'Spells are at most 3 words. Tap a slot to remove one.', { fizzle: true });
  state.picked.push(id);
  update();
}
function unpick(id) {
  if (state.casting) return;
  state.picked = state.picked.filter(w => w !== id);
  update();
}

function cast() {
  if (!state.picked.length || state.casting) return;
  const res = resolve(state.picked);
  const cost = res.cost ?? 0;

  if (res.kind === 'fizzle') {
    showResult('Fizzle', res.hint ? `${res.reason} ${res.hint}.` : res.reason, { fizzle: true });
    return;
  }
  if (state.mana < cost) {
    showResult('Not enough mana', `This spell needs ${cost}. Wait a moment.`, { fizzle: true });
    return;
  }

  state.casting = true;
  state.mana -= cost;
  renderSlots(); renderMeters();
  const ms = CAST_TIME[state.picked.length];
  const bar = $('castProgress');
  bar.style.transition = 'none'; bar.style.width = '0';
  requestAnimationFrame(() => { bar.style.transition = `width ${ms}ms linear`; bar.style.width = '100%'; });

  setTimeout(() => {
    state.casting = false;
    bar.style.transition = 'none'; bar.style.width = '0';
    if (res.kind === 'cancel') {
      showResult('Cancelled', res.reason, { fizzle: true });
    } else {
      if (res.hpCost) state.hp = Math.max(1, state.hp - res.hpCost);
      const isNew = !state.grimoire[res.id];
      if (isNew) {
        state.grimoire[res.id] = { name: res.name, words: res.words, effect: res.effect, secret: res.kind === 'secret' };
        save();
      }
      showResult(res.name, res.effect + (res.hpCost ? ` (−${res.hpCost} health)` : ''), { isNew: isNew && res.kind === 'secret' });
      flash(res.color);
    }
    state.picked = [];
    update();
  }, ms);
}

function flash(color) {
  const b = $('burst'), t = $('target');
  b.style.background = `radial-gradient(circle, ${color} 0%, ${color}00 70%)`;
  b.classList.remove('go'); t.classList.remove('hit');
  void b.offsetWidth;
  b.classList.add('go'); t.classList.add('hit');
}

// ---------- Save (per device, best effort) ----------
function load() {
  try { return JSON.parse(localStorage.getItem('grimoire') || '{}'); } catch { return {}; }
}
function save() {
  try { localStorage.setItem('grimoire', JSON.stringify(state.grimoire)); } catch {}
}

// ---------- Loop ----------
let last = performance.now();
function tick(now) {
  const dt = (now - last) / 1000; last = now;
  if (!state.casting) state.mana = Math.min(MAX, state.mana + MANA_REGEN * dt);
  state.hp = Math.min(MAX, state.hp + HP_REGEN * dt);
  renderMeters();
  requestAnimationFrame(tick);
}

// ---------- Wire up ----------
$('cast').onclick = cast;
$('clear').onclick = () => { if (!state.casting) { state.picked = []; update(); } };
document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => { state.tab = b.dataset.tab; renderBoard(); });
update();
requestAnimationFrame(tick);
