// Spell data, from docs/starter-spell-lexicon.md (v1, 2026-11-08).
// role: S = Source (what it's made of), F = Form (what it does), M = Modifier (how it's tuned)
// adj / noun are used to describe combos that have no hand-made result.

export const ROOTS = [
  // Sources
  { id: 'Ignis',  en: 'Fire',             role: 'S', group: 'Elements',            solo: 'Fireball',                          adj: 'fiery',     color: '#ff7a3d' },
  { id: 'Aqua',   en: 'Water',            role: 'S', group: 'Elements',            solo: 'Water jet',                         adj: 'watery',    color: '#4db5ff' },
  { id: 'Terra',  en: 'Earth',            role: 'S', group: 'Elements',            solo: 'Stone shard',                       adj: 'stone',     color: '#b08a5a' },
  { id: 'Aer',    en: 'Air',              role: 'S', group: 'Elements',            solo: 'Gust of wind',                      adj: 'wind',      color: '#cfeee8' },
  { id: 'Lum',    en: 'Light',            role: 'S', group: 'Elements',            solo: 'Floating light orb',                adj: 'radiant',   color: '#fff3a8' },
  { id: 'Umbra',  en: 'Shadow, Darkness', role: 'S', group: 'Elements',            solo: 'Shadow cloud (on yourself: brief stealth)', adj: 'shadow', color: '#6b5a8e' },
  { id: 'Fulg',   en: 'Storm',            role: 'S', group: 'Elements',            solo: 'Lightning strike',                  adj: 'crackling', color: '#c9b6ff' },
  { id: 'Inan',   en: 'Void',             role: 'S', group: 'Elements',            hint: 'Try Inan Vorte',                    adj: 'void',      color: '#2a2440' },
  { id: 'Sangu',  en: 'Blood',            role: 'S', group: 'Afflictions',         hint: 'Try Sangu Rapt',                    adj: 'blood',     color: '#c22a3a' },
  { id: 'Venen',  en: 'Poison, Blight',   role: 'S', group: 'Afflictions',         hint: 'Try Venen Punct',                   adj: 'venomous',  color: '#7ccf4a' },
  { id: 'Aurum',  en: 'Gild',             role: 'S', group: 'Change and creation', hint: 'Try Aurum Scut',                    adj: 'gilded',    color: '#f2c14e' },
  { id: 'Vita',   en: 'Life',             role: 'S', group: 'Cosmic and moral',    hint: 'Try Vita Cura',                     adj: 'living',    color: '#6fe39a' },
  { id: 'Nex',    en: 'Death',            role: 'S', group: 'Cosmic and moral',    hint: 'Deadly. Needs a Form and more power', adj: 'deathly', color: '#8b8b8b' },
  { id: 'Cael',   en: 'Heaven, Angel',    role: 'S', group: 'Cosmic and moral',    hint: 'Try Evoc Cael',                     adj: 'heavenly',  color: '#e8f4ff' },
  { id: 'Orcus',  en: 'Hell, Demon',      role: 'S', group: 'Cosmic and moral',    hint: 'Try Evoc Orcus',                    adj: 'infernal',  color: '#a3301f' },

  // Forms
  { id: 'Lev',    en: 'Lift',             role: 'F', group: 'Force and motion',    solo: 'Lift an object',                    noun: 'lift' },
  { id: 'Tract',  en: 'Pull',             role: 'F', group: 'Force and motion',    solo: 'Pull a target closer',              noun: 'pull' },
  { id: 'Puls',   en: 'Push',             role: 'F', group: 'Force and motion',    solo: 'Shove a target away',               noun: 'blast that shoves' },
  { id: 'Trem',   en: 'Shake',            role: 'F', group: 'Force and motion',    solo: 'Ground tremor, staggers nearby enemies', noun: 'tremor' },
  { id: 'Vola',   en: 'Flight',           role: 'F', group: 'Force and motion',    solo: 'Short glide',                       noun: 'flight' },
  { id: 'Tele',   en: 'Teleport',         role: 'F', group: 'Force and motion',    solo: 'Short blink',                       noun: 'blink' },
  { id: 'Vorte',  en: 'Maelstrom',        role: 'F', group: 'Elements',            hint: 'Try Aqua Vorte',                    noun: 'vortex' },
  { id: 'Sect',   en: 'Cut',              role: 'F', group: 'Combat',              solo: 'Slash',                             noun: 'slash' },
  { id: 'Punct',  en: 'Pierce',           role: 'F', group: 'Combat',              hint: 'Try Ignis Punct',                   noun: 'bolt' },
  { id: 'Fract',  en: 'Break',            role: 'F', group: 'Combat',              solo: 'Shatter an object or armor',        noun: 'shattering strike' },
  { id: 'Rupt',   en: 'Burst, Explode',   role: 'F', group: 'Combat',              hint: 'Try Ignis Rupt',                    noun: 'burst' },
  { id: 'Scut',   en: 'Shield, Barrier',  role: 'F', group: 'Combat',              solo: 'Basic shield',                      noun: 'shield' },
  { id: 'Torp',   en: 'Paralyze',         role: 'F', group: 'Afflictions',         solo: 'Brief slow',                        noun: 'paralysis' },
  { id: 'Exca',   en: 'Blind',            role: 'F', group: 'Afflictions',         solo: 'Blind one target',                  noun: 'blinding flash' },
  { id: 'Sile',   en: 'Mute',             role: 'F', group: 'Afflictions',         solo: 'Silence an enemy caster',           noun: 'silence' },
  { id: 'Vinc',   en: 'Constrain, Strangle', role: 'F', group: 'Afflictions',      solo: 'Bind one target',                   noun: 'binding' },
  { id: 'Carm',   en: 'Charm',            role: 'F', group: 'Afflictions',         solo: 'Charm a weak creature',             noun: 'charm' },
  { id: 'Muta',   en: 'Transform, Shapeshift', role: 'F', group: 'Change and creation', hint: 'Try Muta Terra',               noun: 'transformation' },
  { id: 'Ple',    en: 'Fill',             role: 'F', group: 'Change and creation', hint: 'Try Aqua Ple',                      noun: 'flood' },
  { id: 'Evoc',   en: 'Conjure, Generate', role: 'F', group: 'Change and creation', hint: 'Try Evoc Terra',                   noun: 'conjuring' },
  { id: 'Cura',   en: 'Heal',             role: 'F', group: 'Change and creation', solo: 'Minor heal',                        noun: 'healing' },
  { id: 'Inven',  en: 'Find',             role: 'F', group: 'Utility',             solo: 'Reveal hidden items',               noun: 'seeking' },
  { id: 'Sera',   en: 'Lock',             role: 'F', group: 'Utility',             solo: 'Seal a door or chest',              noun: 'seal' },
  { id: 'Rese',   en: 'Unlock',           role: 'F', group: 'Utility',             solo: 'Open a simple lock',                noun: 'unsealing' },
  { id: 'Rapt',   en: 'Steal',            role: 'F', group: 'Utility',             hint: 'Try Rapt Aurum',                    noun: 'theft' },
  { id: 'Prec',   en: 'Pray',             role: 'F', group: 'Utility',             solo: 'Minor blessing',                    noun: 'blessing' },
  { id: 'Ius',    en: 'Justice',          role: 'F', group: 'Cosmic and moral',    hint: 'Try Ius Scut',                      noun: 'judgment' },

  // Modifiers (never cast alone; they fill the third slot)
  { id: 'Velox',  en: 'Swift',    role: 'M', group: 'Force and motion',    adj: 'swift',       note: 'Faster cast and travel' },
  { id: 'Aug',    en: 'Increase', role: 'M', group: 'Change and creation', adj: 'greater',     note: 'More power, area or duration' },
  { id: 'Minu',   en: 'Decrease', role: 'M', group: 'Change and creation', adj: 'lesser',      note: 'Cheaper and smaller; weakens enemies with a debuff' },
  { id: 'Furo',   en: 'Wrath',    role: 'M', group: 'Cosmic and moral',    adj: 'wrathful',    note: 'More damage, less defense while active' },
  { id: 'Aetern', en: 'Eternal',  role: 'M', group: 'Cosmic and moral',    adj: 'everlasting', note: 'Much longer effect; 3-word spells only, high cost', rare: true },
];

export const BY_ID = Object.fromEntries(ROOTS.map(r => [r.id, r]));

export const OPPOSITES = [
  ['Lum', 'Umbra'], ['Vita', 'Nex'], ['Cael', 'Orcus'],
  ['Aug', 'Minu'], ['Sera', 'Rese'], ['Puls', 'Tract'],
];

// Hand-made combos (order doesn't matter). Some deliberately break the role rules.
export const SECRETS = [
  { words: ['Ignis', 'Scut'],  name: 'Fire Ward',       effect: 'Fire shield, resists fire attacks' },
  { words: ['Terra', 'Scut'],  name: 'Stone Wall',      effect: 'A wall of stone rises' },
  { words: ['Aqua', 'Vorte'],  name: 'Maelstrom',       effect: 'A churning whirlpool drags everything in' },
  { words: ['Inan', 'Vorte'],  name: 'Void Rift',       effect: 'A void rift that pulls enemies in' },
  { words: ['Ignis', 'Rupt'],  name: 'Explosion',       effect: 'A fiery explosion' },
  { words: ['Ignis', 'Punct'], name: 'Fire Bolt',       effect: 'A piercing fire bolt' },
  { words: ['Sangu', 'Rapt'],  name: 'Life Steal',      effect: 'Drain health from a target into yourself' },
  { words: ['Venen', 'Punct'], name: 'Poison Dart',     effect: 'A poison dart' },
  { words: ['Aurum', 'Scut'],  name: 'Gilded Shield',   effect: 'A gilded shield that reflects light' },
  { words: ['Vita', 'Cura'],   name: 'Strong Heal',     effect: 'A strong heal' },
  { words: ['Evoc', 'Cael'],   name: 'Guardian Angel',  effect: 'Summon a guardian angel' },
  { words: ['Evoc', 'Orcus'],  name: 'Summon Demon',    effect: 'Summon a demon, at a cost to your health', hpCost: 15 },
  { words: ['Evoc', 'Terra'],  name: 'Stone Pillar',    effect: 'Raise a stone pillar' },
  { words: ['Aer', 'Vinc'],    name: 'Choke',           effect: 'Air tightens around a target\'s throat' },
  { words: ['Muta', 'Terra'],  name: 'Petrify',         effect: 'Turn a target to stone' },
  { words: ['Muta', 'Aer'],    name: 'Bird Form',       effect: 'Cast on yourself: become a bird' },
  { words: ['Aqua', 'Ple'],    name: 'Flood',           effect: 'Flood an area' },
  { words: ['Rapt', 'Aurum'],  name: 'Pickpocket',      effect: 'Steal gold' },
  { words: ['Ius', 'Scut'],    name: 'Reflecting Ward', effect: 'A shield that reflects damage' },
  // Retired roots, now cast as combinations
  { words: ['Aug', 'Umbra'],   name: 'Darkness',        effect: 'Deep darkness swallows the area' },
  { words: ['Aer', 'Puls'],    name: 'Sweep',           effect: 'A sweeping wind clears the ground' },
  { words: ['Lum', 'Velox'],   name: 'Shine',           effect: 'A brilliant flash of light' },
  { words: ['Venen', 'Vorte'], name: 'Blight',          effect: 'A spreading blight' },
  { words: ['Vita', 'Terra'],  name: 'Grow',            effect: 'Plants burst from the ground' },
  { words: ['Inan', 'Fract'],  name: 'Disintegrate',    effect: 'Break a target down into nothing' },
  // Three-word
  { words: ['Velox', 'Vita', 'Cura'], name: 'Rapid Restoration', effect: 'A fast, powerful heal' },
  { words: ['Aug', 'Nex', 'Punct'],   name: 'Death Bolt',        effect: 'A bolt of pure death (late game)' },
];

export const MANA_COST = { 1: 10, 2: 20, 3: 35 };
export const CAST_TIME = { 1: 300, 2: 550, 3: 850 }; // ms
