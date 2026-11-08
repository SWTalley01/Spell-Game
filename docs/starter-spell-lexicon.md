# Starter Spell Lexicon

Version 1 · 2026-11-08 · Copy of the doc in the "Mobile Game" Claude project. The game data in `js/lexicon.js` is built from this.

47 spell roots after consolidation, each paired with the English word(s) it covers and its Latin source. Most roots are 3 to 5 letters; Aetern stays at 6 as the rarest word. Forms are kept as short stems (not Latin commands) on purpose, for varied endings and shorter words. This is the starter set; more roots may be added later.

## Elements

| English | Spell root | Latin source | Literal meaning |
| --- | --- | --- | --- |
| Fire | Ignis | ignis | fire |
| Water | Aqua | aqua | water |
| Earth | Terra | terra | earth, land |
| Air | Aer | aer | air |
| Light | Lum | lumen | light |
| Shadow, Darkness | Umbra | umbra | shadow |
| Storm | Fulg | fulgur | lightning |
| Maelstrom | Vorte | vortex | whirlpool |
| Void | Inan | inanis | empty, void |

## Force and motion

| English | Spell root | Latin source | Literal meaning |
| --- | --- | --- | --- |
| Lift | Lev | levare | to raise, lighten |
| Pull | Tract | trahere (tractus) | to drag, draw |
| Push | Puls | pellere (pulsus) | to drive, push |
| Shake | Trem | tremere | to tremble, quake |
| Swift | Velox | velox | swift, rapid |
| Flight | Vola | volare | fly! |
| Teleport | Tele | Greek tele | far off (not Latin) |

## Combat

| English | Spell root | Latin source | Literal meaning |
| --- | --- | --- | --- |
| Cut | Sect | secare (sectus) | to cut |
| Pierce | Punct | pungere (punctus) | to prick, pierce |
| Break | Fract | frangere (fractus) | to break, shatter |
| Burst, Explode | Rupt | rumpere (ruptus) | to burst |
| Shield, Barrier | Scut | scutum | shield |

## Afflictions

| English | Spell root | Latin source | Literal meaning |
| --- | --- | --- | --- |
| Blood | Sangu | sanguis (sanguinis) | blood |
| Paralyze | Torp | torpere | to be numb, stiff |
| Blind | Exca | excaecare | to blind |
| Mute | Sile | silere | be silent! |
| Constrain, Strangle | Vinc | vincire | to bind |
| Poison, Blight | Venen | venenum | poison |
| Charm | Carm | carmen | song, incantation |

## Change and creation

| English | Spell root | Latin source | Literal meaning |
| --- | --- | --- | --- |
| Transform, Shapeshift | Muta | mutare | change! |
| Gild | Aurum | aurum | gold |
| Increase | Aug | augere | to increase, enlarge |
| Decrease | Minu | minuere | to lessen |
| Fill | Ple | implere | to fill |
| Conjure, Generate | Evoc | evocare | to call forth |
| Heal | Cura | cura | care, cure |

## Utility

| English | Spell root | Latin source | Literal meaning |
| --- | --- | --- | --- |
| Find | Inven | invenire | to come upon, find |
| Lock | Sera | sera | bolt, bar |
| Unlock | Rese | reserare | to unbolt, open |
| Steal | Rapt | rapere (raptus) | to seize, snatch |
| Pray | Prec | precari | to pray, entreat |

## Cosmic and moral

| English | Spell root | Latin source | Literal meaning |
| --- | --- | --- | --- |
| Life | Vita | vita | life |
| Death | Nex | nex | violent death, slaughter |
| Eternal | Aetern | aeternus | eternal, everlasting |
| Heaven, Angel | Cael | caelum | sky, heaven |
| Hell, Demon | Orcus | Orcus | Roman god of the underworld |
| Wrath | Furo | furor | rage, frenzy |
| Justice | Ius | ius | law, right |

## Retired roots

These meanings now come from combinations instead of their own word.

| Retired root | Meaning | Now cast as |
| --- | --- | --- |
| Tenebrae | Darkness | Aug Umbra |
| Displo | Explode | Ignis Rupt |
| Verrere | Sweep | Aer Puls |
| Splend | Shine | Lum Velox |
| Gen | Generate | Evoc + a Source (Evoc Terra) |
| Lues | Blight | Venen Vorte |
| Suffoc | Strangle | Aer Vinc |
| Obex | Barrier | Terra Scut |
| Angelus | Angel | Evoc Cael |
| Daemon | Demon | Evoc Orcus |
| Versi | Shapeshift | Muta cast on yourself |
| Cresc | Grow | Vita Terra |
| Dissol | Disintegrate | Inan Fract |

## Spell grammar

Every root has one job: a **Source** sets what a spell is made of, a **Form** sets what it does, and a **Modifier** tunes it. Spells run 1 to 3 words; 3-word spells are the strongest. Players discover words in the world and experiment to find combinations.

- **Full pattern:** Modifier + Source + Form, e.g. Velox Vita Cura (fast, powerful heal).
- **Two words:** Source + Form, e.g. Scut Ignis (fire shield, resists fire attacks).
- **One word:** only roots marked Solo cast alone, e.g. Ignis (fireball). Others fizzle with a hint.
- **Word order:** free; the role decides meaning, so players can tap tiles in any order.
- **Systemic + secret:** most combos follow the role rules; 20 to 40 hand-made combos break the pattern as discoveries.
- **Cost:** mana and cast time rise with word count.
- **Opposites cancel:** Lum / Umbra, Vita / Nex, Cael / Orcus, Aug / Minu, Sera / Rese, Puls / Tract.

Counts: 15 Sources, 27 Forms, 5 Modifiers. Per-root solo effects and example combos are in `js/lexicon.js`.
