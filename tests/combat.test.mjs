import assert from 'node:assert/strict';
import { ROOTS } from '../js/lexicon.js';
import { resolve } from '../js/spells.js';
import { spellFx, Battle, ENEMIES } from '../js/combat.js';

// Every spell that casts must produce effects without crashing
const ids = ROOTS.map(r => r.id); let n = 0, noFx = [];
const tryCast = w => { const r = resolve(w); if (r?.ok) { const fx = spellFx(w); n++;
  const b = new Battle(); b.cast(fx); if (b.drain().some(e => e.text === 'No effect in battle')) noFx.push(w.join(' ')); } };
for (const a of ids) { tryCast([a]); for (const b of ids) { if (b > a) tryCast([a, b]);
  for (const c of ids) if (c > b) tryCast([a, b, c]); } }
console.log('castable spells checked:', n, '| no battle effect:', [...new Set(noFx)].slice(0, 12).join(', '), noFx.length);

// Weakness doubles, resistance halves
let b = new Battle(); assert.equal(b.enemy.name, 'Ember Imp');
b.cast(spellFx(['Aqua'])); assert.equal(b.enemy.hp, 60 - 18);
b = new Battle(); b.cast(spellFx(['Ignis'])); assert.equal(b.enemy.hp, 60 - 5);
assert.ok(b.known['Ember Imp'].size === 0);

// Fire shield blocks a fire attack twice as well
b = new Battle(); b.cast(spellFx(['Ignis', 'Scut'])); b.tick(10);
assert.equal(b.player.hp, 100); console.log('shield left after fire spit:', b.player.shield);

// Blind makes the next attack miss, silence only works on casters
b = new Battle(); b.cast(spellFx(['Exca'])); b.tick(5.1); assert.equal(b.player.hp, 100);
b.tick(3.5); assert.equal(b.player.hp, 92);
b.cast(spellFx(['Sile'])); assert.match(b.drain().at(-1).text, /isn't a caster/);

// Armor halves damage until broken
b = new Battle(); b.index = 1; b.spawn(); b.cast(spellFx(['Sect'])); assert.equal(b.enemy.hp, 110 - 6);
b.cast(spellFx(['Fract'])); assert.equal(b.enemy.armor, false);

// Death bolt, modifiers
assert.equal(spellFx(['Aug','Nex','Punct']).dmg, 40);
assert.equal(spellFx(['Furo','Ignis','Rupt']).dmg, 32);
assert.equal(spellFx(['Velox','Vita','Cura']).castMult, 0.5);
assert.ok(spellFx(['Aetern','Aqua','Scut']).shield === 40);

// A full fight can be won, then the next enemy spawns
b = new Battle(); let t = 0;
while (!b.enemy.defeated && t < 120) { b.cast(spellFx(['Aqua','Rupt'])); b.tick(2); t += 2; }
assert.ok(b.enemy.defeated); b.next(); assert.equal(b.enemy.name, 'Mud Golem');
for (let i = 0; i < ENEMIES.length; i++) b.next(); assert.equal(b.round, 2);
console.log('round 2 Mud Golem hp:', b.enemy.max, 'dmg:', b.enemy.dmg);
console.log('combat tests passed');
