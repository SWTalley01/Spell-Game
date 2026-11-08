# Spell Game

A mobile spell-casting game where you build spells from Latin-rooted words. Built entirely from a phone.

## Play

Open `index.html` through any web server, or the GitHub Pages link once it's on. It's a plain HTML/JS page with no build step.

Tap rune tiles to fill the spell bar (1 to 3 words, any order), then **Cast**.

- **Source** (gold circle): what the spell is made of
- **Form** (blue square): what it does
- **Modifier** (violet diamond): how it's tuned. Only fits in a 3-word spell.

Opposites cancel, wrong combinations fizzle with a hint, and hand-made combos are recorded in the Grimoire as discoveries.

## Layout

| Path | What it is |
| --- | --- |
| `index.html`, `css/style.css` | The page |
| `js/lexicon.js` | All spell data: roots, opposites, secret combos, costs |
| `js/spells.js` | Spell grammar (pure logic, no DOM) |
| `js/game.js` | UI, mana, casting, grimoire |
| `tests/spells.test.mjs` | Rule tests: `node tests/spells.test.mjs` |
| `docs/` | Design docs (lexicon, rune script) |

The design source of truth lives in the "Mobile Game" Claude project; `docs/` holds copies.

## Status

First playable prototype. Runes are placeholder frames (shape and color only) until the real rune art is drawn.
