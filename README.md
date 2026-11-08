# Spell Game

A mobile spell-casting game where you build spells from Latin-rooted words. Built entirely from a phone.

## Play

Open `index.html` through any web server, or the GitHub Pages link once it's on. It's a plain HTML/JS page with no build step.

Tap rune tiles to fill the spell bar (1 to 3 words, any order), then **Cast**.

- **Source** (gold circle): what the spell is made of
- **Form** (blue square): what it does
- **Modifier** (violet diamond): how it's tuned. Only fits in a 3-word spell.

Opposites cancel, wrong combinations fizzle with a hint, and hand-made combos are recorded in the Grimoire as discoveries.

**Battle:** five enemies in a loop (Ember Imp, Mud Golem, Shade, Storm Wisp, Bone Warden), getting tougher each round. Each has a telegraphed attack, an element, and weaknesses you discover by hitting them (or casting Inven). Spells deal damage, heal, shield, stun, slow, blind, silence casters, break armor, summon allies and more. A shield made of the enemy's element blocks twice as well.

## Layout

| Path | What it is |
| --- | --- |
| `index.html`, `css/style.css` | The page |
| `js/lexicon.js` | All spell data: roots, opposites, secret combos, costs |
| `js/spells.js` | Spell grammar (pure logic, no DOM) |
| `js/combat.js` | What spells do in battle, enemies, battle rules |
| `js/game.js` | UI, mana, casting, grimoire |
| `tests/` | Rule tests: `node tests/spells.test.mjs && node tests/combat.test.mjs` |
| `docs/` | Design docs (lexicon, rune script) |

The design source of truth lives in the "Mobile Game" Claude project; `docs/` holds copies.

## Status

First playable prototype. Runes are placeholder frames (shape and color only) until the real rune art is drawn.
