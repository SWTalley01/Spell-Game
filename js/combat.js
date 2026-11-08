// Combat: what each spell does in a fight, the enemies, and the battle rules.
// Pure logic, no DOM, so it can be tested on its own.
import { BY_ID } from './lexicon.js';

const key = words => [...words].sort().join('+');

// ---------- Spell effects ----------
// What each Form does. Numbers are first-pass and meant to be tuned.
const FORM_FX = {
  Lev:   { dmg: 4, interrupt: 1 },
  Tract: { dmg: 5, interrupt: 0.5 },
  Puls:  { dmg: 6, interrupt: 1.5 },
  Trem:  { dmg: 8, stun: 1 },
  Vola:  { dodge: 1 },
  Tele:  { dodge: 1 },
  Vorte: { dmg: 14 },
  Sect:  { dmg: 12 },
  Punct: { dmg: 15 },
  Fract: { dmg: 10, breakArmor: true },
  Rupt:  { dmg: 18 },
  Scut:  { shield: 20 },
  Torp:  { slow: 5 },
  Exca:  { blind: 1 },
  Sile:  { silence: true },
  Vinc:  { dmg: 3, stun: 3 },
  Carm:  { stun: 4 },
  Muta:  { dmg: 8, stun: 2 },
  Ple:   { dmg: 12 },
  Evoc:  { ally: { dps: 4, secs: 6 } },
  Cura:  { heal: 15 },
  Inven: { reveal: true },
  Sera:  {},
  Rese:  {},
  Rapt:  { dmg: 6, manaGain: 15 },
  Prec:  { heal: 8, shield: 8 },
  Ius:   { reflect: true },
};

// One-word Sources
const SOLO_SOURCE_FX = {
  Ignis: { dmg: 10 }, Aqua: { dmg: 9, interrupt: 0.5 }, Terra: { dmg: 10 }, Aer: { dmg: 6, interrupt: 1 },
  Lum: { reveal: true }, Umbra: { blind: 1 }, Fulg: { dmg: 13 },
};

// How a Source flavours whatever Form it's paired with
function applySource(fx, s) {
  fx.element = s;
  const mult = (k, m) => { if (fx[k]) fx[k] = Math.round(fx[k] * m); };
  switch (s) {
    case 'Vita': case 'Cael': mult('heal', 1.5); mult('shield', 1.3); break;
    case 'Nex': case 'Orcus': mult('dmg', 1.4); break;
    case 'Inan': mult('dmg', 1.3); break;
    case 'Fulg': mult('dmg', 1.2); break;
    case 'Aurum': mult('shield', 1.3); break;
    case 'Sangu': if (fx.dmg) fx.lifesteal = true; break;
    case 'Venen': if (fx.dmg) fx.dot = { dps: 3, secs: 6 }; break;
  }
  if (fx.shield) fx.shieldEl = s;
  return fx;
}

// Hand-made combos with their own combat behaviour
const FX_OVERRIDE = {
  'Aug+Umbra':       { element: 'Umbra', blind: 2 },
  'Lum+Velox':       { element: 'Lum', blind: 1, interrupt: 1 },
  'Terra+Vita':      { element: 'Vita', heal: 10, shield: 12 },
  'Inan+Vorte':      { element: 'Inan', dmg: 22, interrupt: 1 },
  'Rapt+Sangu':      { element: 'Sangu', dmg: 12, lifesteal: true },
  'Cael+Evoc':       { element: 'Cael', ally: { dps: 3, secs: 8, heal: 3 } },
  'Evoc+Orcus':      { element: 'Orcus', ally: { dps: 9, secs: 8 } },
  'Aer+Muta':        { element: 'Aer', dodge: 2 },
  'Ius+Scut':        { element: 'Ius', shield: 15, reflect: true },
  'Aurum+Scut':      { element: 'Aurum', shield: 25, shieldEl: 'Aurum', blind: 1 },
  'Aurum+Rapt':      { element: 'Aurum', manaGain: 35 },
  'Muta+Terra':      { element: 'Terra', dmg: 6, stun: 4 },
  'Venen+Vorte':     { element: 'Venen', dmg: 4, dot: { dps: 5, secs: 8 } },
  'Aug+Nex+Punct':   { element: 'Nex', dmg: 40 },
};

const clone = o => JSON.parse(JSON.stringify(o));

function applyModifier(fx, m) {
  const num = (k, x) => { if (fx[k]) fx[k] = Math.round(fx[k] * x); };
  const time = x => { for (const k of ['stun', 'slow', 'interrupt']) if (fx[k]) fx[k] = +(fx[k] * x).toFixed(1);
                       if (fx.ally) fx.ally.secs = Math.round(fx.ally.secs * x);
                       if (fx.dot) fx.dot.secs = Math.round(fx.dot.secs * x); };
  switch (m) {
    case 'Velox': fx.castMult = 0.5; break;
    case 'Aug':   ['dmg', 'heal', 'shield', 'manaGain'].forEach(k => num(k, 1.6)); time(1.5);
                  if (fx.ally) fx.ally.dps = Math.round(fx.ally.dps * 1.6);
                  if (fx.blind) fx.blind += 1; if (fx.dodge) fx.dodge += 1; break;
    case 'Minu':  ['dmg', 'heal', 'shield'].forEach(k => num(k, 0.6)); time(1.5); break;
    case 'Furo':  num('dmg', 1.8); if (fx.ally) fx.ally.dps = Math.round(fx.ally.dps * 1.8); fx.furo = 6; break;
    case 'Aetern': num('heal', 2); num('shield', 2); time(3); if (fx.dot) fx.dot.dps += 1; break;
  }
  return fx;
}

// Turn a cast spell's words into combat effects.
export function spellFx(words) {
  const k = key(words);
  if (FX_OVERRIDE[k]) return clone(FX_OVERRIDE[k]);
  const roots = words.map(w => BY_ID[w]);
  const S = roots.find(r => r.role === 'S');
  const F = roots.find(r => r.role === 'F');
  const M = roots.find(r => r.role === 'M');

  if (words.length === 1) {
    if (S) return { element: S.id, ...clone(SOLO_SOURCE_FX[S.id] || {}) };
    return clone(FORM_FX[F.id]);
  }
  const baseKey = key([S.id, F.id]);
  let fx = FX_OVERRIDE[baseKey] ? clone(FX_OVERRIDE[baseKey]) : applySource(clone(FORM_FX[F.id]), S.id);
  if (M) fx = applyModifier(fx, M.id);
  return fx;
}

// ---------- Enemies ----------
export const ENEMIES = [
  { name: 'Ember Imp',   element: 'Ignis', hp: 60,  weak: ['Aqua'],               resist: ['Ignis'],                  every: 3.5, dmg: 8,  attack: 'Fire spit',     color: '#ff7a3d' },
  { name: 'Mud Golem',   element: 'Terra', hp: 110, weak: ['Aer'],                resist: ['Terra', 'Venen'],         every: 5,   dmg: 16, attack: 'Boulder slam',  color: '#b08a5a', armored: true },
  { name: 'Shade',       element: 'Umbra', hp: 70,  weak: ['Lum', 'Cael'],        resist: ['Umbra', 'Venen'],         every: 3,   dmg: 10, attack: 'Shadow bolt',   color: '#6b5a8e', caster: true },
  { name: 'Storm Wisp',  element: 'Fulg',  hp: 80,  weak: ['Terra'],              resist: ['Fulg', 'Aer'],            every: 2.2, dmg: 7,  attack: 'Zap',           color: '#c9b6ff' },
  { name: 'Bone Warden', element: 'Nex',   hp: 150, weak: ['Vita', 'Cael', 'Lum'], resist: ['Nex', 'Umbra', 'Venen'], every: 4,   dmg: 14, attack: 'Death curse',   color: '#b9b9b9', caster: true, armored: true },
];

// ---------- Battle ----------
export class Battle {
  constructor() {
    this.player = { hp: 100, max: 100, shield: 0, shieldEl: null, dodge: 0, reflect: false, furo: 0 };
    this.index = 0;        // which enemy
    this.round = 1;        // goes up each time all enemies are beaten
    this.events = [];
    this.known = {};       // enemy name -> Set of discovered weaknesses
    this.spawn();
  }

  spawn() {
    const def = ENEMIES[this.index];
    const scale = 1 + (this.round - 1) * 0.35;
    this.allies = [];
    this.enemy = {
      ...def,
      level: this.round,
      max: Math.round(def.hp * scale),
      hp: Math.round(def.hp * scale),
      dmg: Math.round(def.dmg * (1 + (this.round - 1) * 0.2)),
      timer: def.every + 1.5,   // a moment to breathe before the first attack
      stun: 0, slow: 0, blind: 0, silenced: false, armor: !!def.armored, dots: [],
      defeated: false,
    };
    this.known[def.name] ??= new Set();
    this.emit('spawn', `${def.name} appears!`);
  }

  next() {
    this.index++;
    if (this.index >= ENEMIES.length) { this.index = 0; this.round++; }
    const p = this.player;
    p.hp = Math.min(p.max, p.hp + 30);
    p.shield = 0; p.dodge = 0; p.reflect = false; p.furo = 0;
    this.spawn();
  }

  get over() { return this.player.hp <= 0; }

  emit(type, text, amt) { this.events.push({ type, text, amt }); }
  drain() { const e = this.events; this.events = []; return e; }

  elementMult(el) {
    const e = this.enemy;
    if (!el) return 1;
    if (e.weak.includes(el)) { this.known[e.name].add(el); return 2; }
    if (e.resist.includes(el)) return 0.5;
    return 1;
  }

  hurtEnemy(amt, el, label = '') {
    const e = this.enemy;
    if (e.defeated) return 0;
    const m = this.elementMult(el);
    let dmg = amt * m;
    if (e.armor) dmg *= 0.5;
    dmg = Math.max(1, Math.round(dmg));
    e.hp = Math.max(0, e.hp - dmg);
    const tag = m > 1 ? 'Weak!' : m < 1 ? 'Resisted' : e.armor ? 'Armored' : '';
    this.emit('enemyHit', [label, tag].filter(Boolean).join(' '), dmg);
    if (e.hp <= 0) { e.defeated = true; this.emit('defeated', `${e.name} is defeated!`); }
    return dmg;
  }

  cast(fx, hpCost = 0) {
    const e = this.enemy, p = this.player;
    if (e.defeated || this.over) return;
    if (hpCost) { p.hp = Math.max(1, p.hp - hpCost); this.emit('playerHit', 'Blood price', hpCost); }

    if (fx.breakArmor && e.armor) { e.armor = false; this.emit('info', 'Armor shattered!'); }
    if (fx.dmg) {
      const dealt = this.hurtEnemy(fx.dmg, fx.element);
      if (fx.lifesteal) this.healPlayer(Math.round(dealt * 0.5));
    }
    if (fx.dot) e.dots.push({ ...fx.dot, el: fx.element, acc: 0 });
    if (fx.interrupt) { e.timer += fx.interrupt; this.emit('info', 'Interrupted'); }
    if (fx.stun) { e.stun = Math.max(e.stun, fx.stun); this.emit('info', `Stunned ${fx.stun}s`); }
    if (fx.slow) { e.slow = Math.max(e.slow, fx.slow); this.emit('info', `Slowed ${fx.slow}s`); }
    if (fx.blind) { e.blind += fx.blind; this.emit('info', 'Blinded'); }
    if (fx.silence) {
      if (e.caster) { e.silenced = true; this.emit('info', 'Silenced'); }
      else this.emit('info', `${e.name} isn't a caster`);
    }
    if (fx.heal) this.healPlayer(fx.heal);
    if (fx.shield) { p.shield += fx.shield; p.shieldEl = fx.shieldEl || null; this.emit('info', `+${fx.shield} shield`); }
    if (fx.dodge) { p.dodge += fx.dodge; this.emit('info', 'Ready to dodge'); }
    if (fx.reflect) { p.reflect = true; this.emit('info', 'Reflect ready'); }
    if (fx.ally) { this.allies.push({ ...fx.ally, el: fx.element, acc: 0 }); this.emit('info', 'An ally joins you'); }
    if (fx.furo) { p.furo = fx.furo; this.emit('info', 'Wrath: you take more damage'); }
    if (fx.reveal) {
      e.weak.forEach(w => this.known[e.name].add(w));
      this.emit('info', `Weak to ${e.weak.join(', ')}`);
    }
    if (!Object.keys(fx).some(k => k !== 'element' && k !== 'castMult')) this.emit('info', 'No effect in battle');
  }

  healPlayer(n) {
    const p = this.player;
    const before = p.hp;
    p.hp = Math.min(p.max, p.hp + n);
    if (p.hp > before) this.emit('heal', 'Healed', p.hp - before);
  }

  tick(dt) {
    const e = this.enemy, p = this.player;
    if (e.defeated || this.over) return;
    if (p.furo > 0) p.furo = Math.max(0, p.furo - dt);

    // Allies and lingering damage, reported once per second
    for (const list of [this.allies, e.dots]) {
      for (const a of list) {
        a.secs -= dt; a.acc += a.dps * dt;
        if (a.acc >= a.dps) {
          this.hurtEnemy(a.acc, a.el, list === this.allies ? 'Ally' : 'Poison');
          if (a.heal) this.healPlayer(a.heal);
          a.acc = 0;
        }
      }
    }
    this.allies = this.allies.filter(a => a.secs > 0);
    e.dots = e.dots.filter(d => d.secs > 0);
    if (e.defeated) return;

    if (e.stun > 0) { e.stun = Math.max(0, e.stun - dt); return; }
    if (e.slow > 0) e.slow = Math.max(0, e.slow - dt);
    e.timer -= dt * (e.slow > 0 ? 0.5 : 1);
    if (e.timer <= 0) { this.enemyAttack(); e.timer = e.every; }
  }

  enemyAttack() {
    const e = this.enemy, p = this.player;
    if (e.silenced) { e.silenced = false; this.emit('info', `${e.attack} fizzles, silenced`); return; }
    if (e.blind > 0) { e.blind--; this.emit('info', `${e.attack} misses`); return; }
    if (p.dodge > 0) { p.dodge--; this.emit('info', `Dodged ${e.attack}`); return; }
    let dmg = Math.round(e.dmg * (p.furo > 0 ? 1.5 : 1));
    if (p.reflect) { p.reflect = false; this.hurtEnemy(dmg, null, 'Reflected'); return; }
    if (p.shield > 0) {
      const mult = p.shieldEl && p.shieldEl === e.element ? 2 : 1; // matching shields block twice as well
      const absorbed = Math.min(dmg, p.shield * mult);
      dmg -= absorbed;
      p.shield = Math.max(0, p.shield - Math.ceil(absorbed / mult));
      if (!p.shield) p.shieldEl = null;
      this.emit('info', mult > 1 ? `Shield held strong (${absorbed})` : `Shield blocked ${absorbed}`);
    }
    if (dmg > 0) {
      p.hp = Math.max(0, p.hp - dmg);
      this.emit('playerHit', e.attack, dmg);
      if (p.hp <= 0) this.emit('lost', 'You have fallen');
    }
  }
}
