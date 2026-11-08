# Spell Game

A mobile spell-casting game where you build spells from Latin-rooted words. Built entirely from a phone.

## Play

Open `index.html` through any web server, or the GitHub Pages link. Plain HTML/JS, no build step.

**Primary screen** (`index.html`): location card with day clock, the character scene, and three actions:
- **Explore**: placeholder for the map.
- **Study**: pick a library, walk there (time passes), then open a tome. The tome arrives, opens, flips and dives into the Runic Primer. Lessons: **Copy** (match faded runes), **Recall** (from memory), **Read** (name the rune). Streaks multiply XP, each page adds ink toward an unknown word, and a full word unlocks a rune-turning puzzle that reveals it (TELE).
- **Profession**: Smithing (timed hammer strikes), Mining, Alchemy.

Plus Bag, Gear, Stats and Quests sheets. Tap the location card to preview other regions.

**Spell practice** (`practice.html`): the earlier spell-bar prototype. Kept as a starting point for a practice screen; its battle mode is not the planned combat flow.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | Primary screen markup (template format, see `js/dc-lite.js`) |
| `screens/primary.js` | Primary screen + tome logic |
| `css/primary.css`, `css/shell.css` | Animations and styles; fitting the 390 × 844 frame to any phone |
| `js/dc-lite.js` | Small runtime for the prototype template format |
| `assets/tome/` | Tome art (cover, spread, parchment, corner ornament, lesson icons; the turning leaf is a stand-in) |
| `practice.html`, `css/style.css` | Spell practice page |
| `js/lexicon.js` | All spell data: roots, opposites, secret combos, costs |
| `js/spells.js` | Spell grammar (pure logic, no DOM) |
| `js/combat.js` | What spells do in battle, enemies, battle rules |
| `js/game.js` | Practice page UI, mana, casting, grimoire |
| `tests/` | Rule tests: `node tests/spells.test.mjs && node tests/combat.test.mjs` |
| `docs/` | Design docs (lexicon, rune script) |

The design source of truth lives in the "Mobile Game" Claude project; `docs/` holds copies.

## Status

- Primary screen and tome study ported from the "Tome Prototype" design canvas (2026-11-08).
- Tome art is the original generated art, except `tome-leaf.png` (the turning page), which is still a stand-in.
- Combat is to be redesigned.
