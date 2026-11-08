// Spell grammar: turns a set of tapped words into a result.
// Pure logic, no DOM, so it can be tested on its own.
import { BY_ID, OPPOSITES, SECRETS, MANA_COST } from './lexicon.js';

const key = words => [...words].sort().join('+');
const SECRET_MAP = new Map(SECRETS.map(s => [key(s.words), s]));

const fizzle = (reason, extra = {}) => ({ ok: false, kind: 'fizzle', reason, ...extra });

export function resolve(words) {
  const n = words.length;
  if (n === 0) return null;
  if (n > 3) return fizzle('Too many words. Spells are 1 to 3 words.');
  if (new Set(words).size !== n) return fizzle('The same word twice tangles the spell.');

  const roots = words.map(w => BY_ID[w]);
  const cost = MANA_COST[n];

  // Opposites cancel
  for (const [a, b] of OPPOSITES) {
    if (words.includes(a) && words.includes(b)) {
      return { ok: false, kind: 'cancel', reason: `${a} and ${b} are opposites. They cancel out.`, cost };
    }
  }

  // Hand-made discoveries come first: they may break the rules
  const secret = SECRET_MAP.get(key(words));
  if (secret) {
    return { ok: true, kind: 'secret', id: key(words), name: secret.name, effect: secret.effect,
             hpCost: secret.hpCost || 0, cost, words, color: sourceColor(roots) };
  }

  const S = roots.filter(r => r.role === 'S');
  const F = roots.filter(r => r.role === 'F');
  const M = roots.filter(r => r.role === 'M');

  if (n === 1) {
    const r = roots[0];
    if (r.role === 'M') return fizzle(`${r.id} is a Modifier. It only fills the third slot of a full spell.`);
    if (r.solo) return { ok: true, kind: 'solo', id: r.id, name: r.id, effect: r.solo, cost, words, color: r.color };
    return fizzle(`${r.id} won't cast alone.`, { hint: r.hint });
  }

  if (M.length > 1) return fizzle('Only one Modifier fits in a spell.');
  if (S.length > 1) return fizzle('Two Sources clash. A spell is made of one thing.');
  if (F.length > 1) return fizzle('Two Forms pull in different directions. A spell does one thing.');

  if (n === 2) {
    if (M.length) return fizzle(`${M[0].id} is a Modifier. Add a Source and a Form to make a 3-word spell.`);
    // one Source + one Form
    return { ok: true, kind: 'combo', id: key(words), name: `${S[0].id} ${F[0].id}`,
             effect: cap(`${article(S[0].adj)} ${S[0].adj} ${F[0].noun}`), cost, words, color: S[0].color };
  }

  // n === 3: Modifier + Source + Form
  if (!M.length) return fizzle('A 3-word spell needs a Modifier, a Source and a Form.');
  const m = M[0];
  const base = SECRET_MAP.get(key([S[0].id, F[0].id]));
  const baseName = base ? base.name : `${S[0].id} ${F[0].id}`;
  const baseEffect = base ? base.effect.toLowerCase().replace(/^(an?|the) /, '') : `${S[0].adj} ${F[0].noun}`;
  return { ok: true, kind: 'combo', id: key(words), name: `${m.id} ${baseName}`,
           effect: cap(`${m.adj} ${baseEffect}`) + ` (${m.note.toLowerCase()})`,
           hpCost: base?.hpCost || 0, cost: m.rare ? cost + 25 : m.id === 'Minu' ? cost - 12 : cost, words, color: S[0].color };
}

function sourceColor(roots) {
  return (roots.find(r => r.role === 'S') || {}).color || '#c9b6ff';
}
function article(word) { return /^[aeiou]/i.test(word) ? 'an' : 'a'; }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
