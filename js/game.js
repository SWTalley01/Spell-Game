import { ROOTS, BY_ID, CAST_TIME } from './lexicon.js';
import { resolve } from './spells.js';
import { spellFx, Battle } from './combat.js';

const $ = id => document.getElementById(id);
const MAX_MANA = 100, MANA_REGEN = 8; // per second

const state = {
  tab: 'S',
  picked: [],
  mana: MAX_MANA,
  casting: false,
  grimoire: load(),
  battle: new Battle(),
  between: false, // pause between enemies
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
  $('cast').disabled = !state.picked.length || state.casting || state.battle.over;
}

function chips(el, list) {
  el.innerHTML = list.map(([text, cls]) => `<span class="chip ${cls || ''}">${text}</span>`).join('');
}

function renderBattle() {
  const { player: p, enemy: e, allies, known } = state.battle;
  $('mana').style.width = state.mana + '%';
  $('manaNum').textContent = Math.floor(state.mana);
  $('hp').style.width = (p.hp / p.max * 100) + '%';
  $('hpNum').textContent = Math.ceil(p.hp);
  const pc = [];
  if (p.shield) pc.push([`Shield ${p.shield}${p.shieldEl ? ' · ' + p.shieldEl : ''}`, 'good']);
  if (p.dodge) pc.push([`Dodge ×${p.dodge}`, 'good']);
  if (p.reflect) pc.push(['Reflect', 'good']);
  if (allies.length) pc.push([`Allies ${allies.length}`, 'good']);
  if (p.furo) pc.push(['Wrath', 'bad']);
  chips($('playerChips'), pc);

  $('foeName').textContent = e.name;
  $('foeLevel').textContent = e.level > 1 ? `Round ${e.level}` : '';
  $('foeHp').style.width = (e.hp / e.max * 100) + '%';
  $('foeHpNum').textContent = `${Math.ceil(e.hp)} / ${e.max}`;
  const k = known[e.name];
  $('foeWeak').textContent = 'Weak to: ' + (k.size ? [...k].join(', ') : '???');
  const ec = [];
  if (e.armor) ec.push(['Armored']);
  if (e.caster) ec.push(['Caster']);
  if (e.stun) ec.push([`Stunned ${e.stun.toFixed(1)}s`, 'good']);
  if (e.slow) ec.push([`Slowed ${e.slow.toFixed(1)}s`, 'good']);
  if (e.blind) ec.push([`Blind ×${e.blind}`, 'good']);
  if (e.silenced) ec.push(['Silenced', 'good']);
  if (e.dots.length) ec.push(['Poisoned', 'good']);
  chips($('foeChips'), ec);

  const t = $('target');
  t.style.background = e.color + '55';
  t.style.borderColor = e.color;
  t.classList.toggle('down', e.defeated);
  const intent = document.querySelector('.intent');
  if (e.defeated) { $('intentText').textContent = ''; $('intent').style.width = '0'; }
  else {
    $('intentText').textContent = e.stun ? `${e.name} is stunned` : `${e.attack} in ${Math.max(0, e.timer).toFixed(1)}s`;
    $('intent').style.width = Math.max(0, Math.min(1, 1 - e.timer / e.every)) * 100 + '%';
    intent.classList.toggle('soon', e.timer < 1 && !e.stun);
  }
}

function showResult(title, sub, { fizzle = false, isNew = false } = {}) {
  const r = $('result');
  r.className = 'result' + (fizzle ? ' fizzle' : '');
  r.innerHTML = (isNew ? '<span class="new">NEW DISCOVERY</span>' : '') +
    `<p class="title"></p><p class="sub"></p>`;
  r.querySelector('.title').textContent = title;
  r.querySelector('.sub').textContent = sub;
}

let floatSlot = 0;
function floater(ev) {
  const f = document.createElement('div');
  f.className = `float ${ev.type}`;
  const sign = ev.type === 'heal' ? '+' : ev.type === 'enemyHit' || ev.type === 'playerHit' ? '−' : '';
  f.textContent = (ev.amt ? `${sign}${ev.amt} ` : '') + (ev.text || '');
  f.style.marginLeft = ((floatSlot++ % 3) - 1) * 46 + 'px';
  $('floats').append(f);
  setTimeout(() => f.remove(), 1200);
}

function handleEvents() {
  for (const ev of state.battle.drain()) {
    if (ev.type === 'spawn') continue;
    if (ev.type === 'enemyHit') hitTarget();
    if (ev.type === 'defeated') onDefeat();
    if (ev.type === 'lost') onLost();
    floater(ev);
  }
}

function update() {
  renderSlots();
  renderBoard();
  renderBattle();
  $('found').textContent = Object.keys(state.grimoire).length;
}

// ---------- Battle flow ----------
function onDefeat() {
  state.between = true;
  const name = state.battle.enemy.name;
  showResult(`${name} defeated`, 'Catch your breath. The next foe approaches…');
  setTimeout(() => {
    state.battle.next();
    state.between = false;
    showResult(`${state.battle.enemy.name} appears`, 'Find its weakness.');
    handleEvents();
    update();
  }, 2200);
}

function onLost() {
  const b = state.battle;
  const beaten = (b.round - 1) * 5 + b.index;
  $('overlayTitle').textContent = 'You have fallen';
  $('overlaySub').textContent = `Foes defeated: ${beaten}. Your grimoire is kept.`;
  $('overlay').hidden = false;
  state.picked = [];
  update();
}

$('overlayBtn').onclick = () => {
  state.battle = new Battle();
  state.mana = MAX_MANA;
  state.between = false;
  $('overlay').hidden = true;
  showResult(`${state.battle.enemy.name} appears`, 'Tap runes to build a spell, then cast.');
  state.battle.drain();
  update();
};

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
  if (!state.picked.length || state.casting || state.battle.over) return;
  const words = [...state.picked];
  const res = resolve(words);
  const cost = res.cost ?? 0;

  if (res.kind === 'fizzle') {
    showResult('Fizzle', res.hint ? `${res.reason} ${res.hint}.` : res.reason, { fizzle: true });
    return;
  }
  if (state.mana < cost) {
    showResult('Not enough mana', `This spell needs ${cost}. Wait a moment.`, { fizzle: true });
    return;
  }

  const fx = res.ok ? spellFx(words) : null;
  state.casting = true;
  state.mana -= cost;
  renderSlots();
  const ms = CAST_TIME[words.length] * (fx?.castMult || 1);
  const bar = $('castProgress');
  bar.style.transition = 'none'; bar.style.width = '0';
  requestAnimationFrame(() => { bar.style.transition = `width ${ms}ms linear`; bar.style.width = '100%'; });

  setTimeout(() => {
    state.casting = false;
    bar.style.transition = 'none'; bar.style.width = '0';
    if (state.battle.over) return update();
    if (res.kind === 'cancel') {
      showResult('Cancelled', res.reason, { fizzle: true });
    } else {
      const isNew = !state.grimoire[res.id];
      if (isNew) {
        state.grimoire[res.id] = { name: res.name, words: res.words, effect: res.effect, secret: res.kind === 'secret' };
        save();
      }
      showResult(res.name, res.effect, { isNew: isNew && res.kind === 'secret' });
      flash(res.color);
      if (!state.between) {
        state.battle.cast(fx, res.hpCost);
        if (fx.manaGain) state.mana = Math.min(MAX_MANA, state.mana + fx.manaGain);
        handleEvents();
      }
    }
    state.picked = [];
    update();
  }, ms);
}

function hitTarget() {
  const t = $('target');
  t.classList.remove('hit'); void t.offsetWidth; t.classList.add('hit');
}

function flash(color) {
  const b = $('burst');
  b.style.background = `radial-gradient(circle, ${color} 0%, ${color}00 70%)`;
  b.classList.remove('go'); void b.offsetWidth; b.classList.add('go');
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
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (!state.battle.over) {
    if (!state.casting) state.mana = Math.min(MAX_MANA, state.mana + MANA_REGEN * dt);
    if (!state.between) state.battle.tick(dt);
    handleEvents();
  }
  renderBattle();
  requestAnimationFrame(tick);
}

// ---------- Wire up ----------
$('cast').onclick = cast;
$('clear').onclick = () => { if (!state.casting) { state.picked = []; update(); } };
document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => { state.tab = b.dataset.tab; renderBoard(); });
state.battle.drain();
showResult(`${state.battle.enemy.name} appears`, 'Tap runes to build a spell, then cast.');
update();
requestAnimationFrame(tick);
