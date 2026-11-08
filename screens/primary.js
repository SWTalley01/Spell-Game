// Primary screen: location card, scene, Explore / Study / Profession, sheets,
// the profession activities and the tome study minigame.
// Ported from the "Tome Prototype" design canvas (2026-11-08). Markup lives in index.html.
import { DCLogic, mount } from '../js/dc-lite.js';

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = {
      loc: 0, minutes: 1092, sheet: '', armor: 'steel', shield: true, sel: 6, toast: '', toastOn: false,
      view: 'home', pickStudy: 0, pickCraft: 0, travelTo: '', travelPct: 0, travelArrive: '', act: '', placeAt: '',
      result: '', rare: false, heat: 20, fade: false, fadeText: '',
      studyOpen: false, slots: [], filled: [], cur: 0, last: -1, tiles: [], wrong: '', done: false, pageXp: 0, margin: '',
      mode: 'copy', streak: 0, xp: 0, ink: 50, pageNum: 1, flipping: false,
      tome: '', tomeFrom: '', reveal: '', rot: [0, 0, 0, 0, 0, 0, 0, 0, 0], turns: 0, revealN: 0, learned: false, understood: false, teleSeen: 0, dawn: false
    };
  }
  componentDidMount() {
    this.clock = setInterval(() => { if (this.state.view !== 'travel') this.setState({ minutes: (this.state.minutes + 1) % 1440 }); }, 1000);
    this.heatT = setInterval(() => { if (this.state.act === 'smithing' && this.state.view === 'activity') this.setState({ heat: (this.state.heat + 7) % 110 }); }, 90);
  }
  componentWillUnmount() { clearInterval(this.clock); clearInterval(this.heatT); clearInterval(this.walkT); clearTimeout(this.toastT); this.clearTome(); }
  showToast(t) {
    this.setState({ toast: t, toastOn: true });
    clearTimeout(this.toastT);
    this.toastT = setTimeout(() => this.setState({ toastOn: false }), 1600);
  }
  fmt(m) {
    m = ((m % 1440) + 1440) % 1440;
    const hh = Math.floor(m / 60), mm = m % 60;
    return ((hh + 11) % 12 + 1) + ':' + (mm < 10 ? '0' : '') + mm + (hh < 12 ? ' AM' : ' PM');
  }
  dur(mins) {
    if (mins < 60) return mins + ' min';
    return Math.floor(mins / 60) + ' h' + (mins % 60 ? ' ' + (mins % 60) + ' min' : '');
  }
  fadeTo(text, fn) {
    this.setState({ fade: true, fadeText: text });
    setTimeout(() => { fn(); setTimeout(() => this.setState({ fade: false }), 450); }, 380);
  }
  studyOpts() {
    return [
      { act: 'study', title: 'Tallow Lane Reading Room', name: 'Tallow Lane Reading Room', mins: 40, sub: 'Nearest · common tomes · open late' },
      { act: 'study', title: 'The Ashfall Archive', name: 'The Ashfall Archive', mins: 190, sub: 'Rare tomes · scholars may ask questions' }
    ];
  }
  craftOpts() {
    return [
      { act: 'smithing', title: 'Smithing', name: 'Ironbell Forge', mins: 25, sub: 'Ironbell Forge · anvil, bellows, quench barrel' },
      { act: 'mining', title: 'Mining', name: 'Old Cinder Mine', mins: 70, sub: 'Old Cinder Mine · iron, coal, rumors of moonsilver' },
      { act: 'alchemy', title: 'Alchemy', name: "Hedgewitch's Bench", mins: 50, sub: "Hedgewitch's Bench · burner, glassware, herbs" }
    ];
  }
  acts() {
    return {
      study: { accent: '#A78BFA', shadow: '#5B45A8', label: 'Open a tome', open: 'Dust drifts between the shelves. A tome waits on the reading stand.' },
      smithing: { accent: '#F5B544', shadow: '#9A6A1A', label: 'Hammer', open: 'The forge roars. Strike when the iron glows inside the window.' },
      mining: { accent: '#7DD3FC', shadow: '#2B7FA8', label: 'Strike the vein', open: 'Your lantern catches a glint in the rock.' },
      alchemy: { accent: '#4ADE80', shadow: '#1F8A4C', label: 'Stir', open: 'The flask begins to simmer.' }
    };
  }
  go() {
    const s = this.state;
    const opt = s.sheet === 'study' ? this.studyOpts()[s.pickStudy] : this.craftOpts()[s.pickCraft];
    const a = this.acts()[opt.act];
    if (s.placeAt === opt.name) {
      this.setState({ sheet: '' });
      this.fadeTo(opt.name, () => this.setState({ view: 'activity', act: opt.act, result: a.open, rare: false }));
      return;
    }
    const start = s.minutes;
    this.setState({ sheet: '', view: 'travel', travelTo: opt.name, travelPct: 0, travelArrive: this.fmt(start + opt.mins) });
    setTimeout(() => this.setState({ travelPct: 100 }), 40);
    let i = 0;
    clearInterval(this.walkT);
    this.walkT = setInterval(() => {
      i++;
      this.setState({ minutes: (start + Math.round(opt.mins * i / 24)) % 1440 });
      if (i >= 24) {
        clearInterval(this.walkT);
        this.fadeTo(opt.name, () => this.setState({ view: 'activity', act: opt.act, placeAt: opt.name, result: a.open, rare: false }));
      }
    }, 100);
  }
  doAct() {
    const s = this.state;
    if (s.act === 'study') { this.openStudy(); return; }
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    let text = '', rare = false;
    if (s.act === 'study') {
      if (Math.random() < 0.18) { text = 'Hidden behind the almanacs: a torn page bearing the root word KESH. Added to your grimoire.'; rare = true; }
      else text = pick(['A ledger of grain prices. Useful, if dull.', 'A tome on river spirits. One margin note repeats a word: ORIN.', 'Nothing new on this shelf.', 'A loose page slips out: a sketch of a shrine you have seen before.', 'A history of the Ironcrown succession. Three kings, one missing.']);
    } else if (s.act === 'smithing') {
      const ok = s.heat >= 70 && s.heat <= 90;
      text = ok ? 'CLANG. A perfect strike. The edge folds clean.' : (s.heat > 90 ? 'Too late. The iron has dulled.' : 'A dull thud. The iron was not ready.');
      rare = ok;
    } else if (s.act === 'mining') {
      if (Math.random() < 0.14) { text = 'A vein of moonsilver glints! + Moonsilver Ore ×1'; rare = true; }
      else text = pick(['+ Iron Ore ×1', '+ Iron Ore ×2', 'Only rubble this time.', '+ Coal ×3']);
    } else if (s.act === 'alchemy') {
      if (Math.random() < 0.2) { text = 'It shimmers violet. A Healing Draught takes shape.'; rare = true; }
      else text = pick(['The mixture turns amber.', 'Too fast. It clouds, then slowly clears.', 'A thin green steam curls up.']);
    }
    this.setState({ result: text, rare: rare });
  }
  runeData() {
    const F = { source: 'M10 50 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0', form: 'M14 14 H86 V86 H14 Z' };
    const C = { source: '#8F5A0F', form: '#1F5C8A' };
    const g = 'M32 68 H68', w = 'M42 28 L50 22 L58 28', v = 'M38 66 Q50 78 62 66', ringS = 'M44 50 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0';
    const d = {
      Ignis: ['Fire', 'source', g + ' M50 22 C53 33 65 39 64 53 C63 62 57 67 50 67 C43 67 37 62 36 53 C35 45 40 41 42 34 C44 40 46 43 48 43 C48 35 46 29 50 22 Z M50 47 C54 52 56 56 55 60 C54 63 52 64 50 64 C48 64 46 62 46 59 C46 55 49 52 50 47 Z'],
      Aqua: ['Water', 'source', g + ' M30 54 q10 -10 20 0 t20 0 M30 40 q10 -10 20 0 t20 0'],
      Terra: ['Earth', 'source', g + ' M34 62 L50 34 L66 62'],
      Aer: ['Air', 'source', g + ' M32 50 Q50 26 68 50 M38 58 Q50 46 62 58'],
      Lum: ['Light', 'source', g + ' ' + ringS + ' M50 38 V28 M40 42 L34 34 M60 42 L66 34'],
      Umbra: ['Shadow', 'source', 'M32 32 H68 ' + ringS + ' M50 62 V72 M40 58 L34 66 M60 58 L66 66'],
      Lev: ['Lift', 'form', 'M34 50 L50 32 L66 50 M38 64 H62'],
      Puls: ['Push', 'form', 'M30 50 H70 M56 36 L70 50 L56 64'],
      Tract: ['Pull', 'form', 'M30 50 H70 M44 36 L30 50 L44 64'],
      Scut: ['Shield', 'form', w + ' M36 36 H64 V52 Q64 66 50 72 Q36 66 36 52 Z'],
      Sect: ['Cut', 'form', w + ' M34 70 L66 36'],
      Cura: ['Heal', 'form', v + ' M50 30 V58 M37 44 H63']
    };
    if (this.state.learned) d.Tele = [this.state.understood ? 'Teleport' : '? ? ?', 'form', 'M30 50 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M58 50 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M46 50 H54'];
    const out = {};
    Object.keys(d).forEach((k) => { out[k] = { name: k, en: d[k][0], glyph: d[k][2], frame: F[d[k][1]], color: C[d[k][1]] }; });
    return out;
  }
  shuffle(a) {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; }
    return b;
  }
  newPage() {
    let order = this.shuffle(Object.keys(this.runeData()));
    if (this.state.learned && !this.state.understood) order = ['Tele'].concat(order.filter((k) => k !== 'Tele'));
    const answers = this.shuffle(order.slice(0, 4));
    this.setState({ slots: answers, filled: [false, false, false, false], cur: 0, last: -1, tiles: this.shuffle(answers.concat(order.slice(4, 8))), wrong: '', done: false, pageXp: 0, margin: '', dawn: false });
  }
  clearTome() { (this.tomeT || []).forEach((t) => clearTimeout(t)); this.tomeT = []; }
  tomeSeq(steps) {
    this.clearTome();
    let at = 0;
    steps.forEach((st) => { at += st[0]; this.tomeT.push(setTimeout(st[1], at)); });
  }
  openStudy() {
    if (this.state.tome) return;
    if (!this.state.slots.length) this.newPage();
    this.setState({ tome: 'arrive', xp: 0 });
    this.tomeSeq([
      [820, () => this.setState({ tome: 'opening' })],
      [680, () => this.setState({ tome: 'flip' })],
      [1250, () => this.setState({ tome: 'dive' })],
      [640, () => this.setState({ tome: 'menu' })]
    ]);
  }
  pickLesson(m) {
    const s = this.state;
    if (s.tome !== 'menu') return;
    if (m !== s.mode || !s.slots.length || s.done) { this.setState({ mode: m, streak: 0 }); this.newPage(); }
    this.setState({ tome: 'turn' });
    this.tomeSeq([[920, () => this.setState({ tome: 'game' })]]);
  }
  toContents() {
    if (this.state.tome !== 'game') return;
    this.setState({ tome: 'unturn' });
    this.tomeSeq([[920, () => this.setState({ tome: 'menu' })]]);
  }
  closeTome() {
    const t = this.state.tome;
    if (t !== 'menu' && t !== 'game') return;
    this.setState({ tome: 'close1', tomeFrom: t });
    this.tomeSeq([
      [540, () => this.setState({ tome: 'close2' })],
      [720, () => this.setState({ tome: 'close3' })],
      [600, () => { this.setState({ tome: '' }); this.closeStudy(); }]
    ]);
  }
  closeStudy() {
    const x = this.state.xp;
    this.setState({ studyOpen: false, rare: x > 0, result: x ? 'You close the tome. +' + x + ' magic XP this visit.' : 'You close the tome without reading.' });
  }
  tapTile(n) {
    const s = this.state;
    if (s.done || s.cur >= 4 || s.slots.slice(0, s.cur).indexOf(n) !== -1) return;
    if (n === s.slots[s.cur]) {
      const streak = s.streak + 1;
      const mult = Math.min(3, 1 + Math.floor(streak / 3) * 0.5);
      const gain = Math.round({ copy: 8, recall: 12, read: 16 }[s.mode] * mult);
      const filled = s.filled.slice();
      filled[s.cur] = true;
      const cur = s.cur + 1;
      this.setState({ streak: streak, filled: filled, cur: cur, last: s.cur, xp: s.xp + gain, pageXp: s.pageXp + gain, wrong: '' });
      if (cur >= 4) {
        setTimeout(() => {
          const notes = [
            'In the margin: "Terra answers those who kneel."',
            'A dried wolfsbane flower is pressed between these pages.',
            'A doodle of a shrine. The one at Mossgate?',
            'A scribbled rumor: the Ashfall Archive keeps a locked room.',
            'Someone has underlined Lum three times, then crossed it out.'
          ];
          const margin = Math.random() < 0.35 ? notes[Math.floor(Math.random() * notes.length)] : '';
          const st = this.state;
          let seen = st.teleSeen, understood = st.understood, dawn = false;
          if (st.learned && !st.understood && st.slots.indexOf('Tele') !== -1) { seen++; if (seen >= 3) { understood = true; dawn = true; } }
          this.setState({ done: true, ink: Math.min(100, st.ink + 25), margin: margin, teleSeen: seen, understood: understood, dawn: dawn });
        }, 450);
      }
    } else {
      this.setState({ wrong: n, streak: 0 });
      clearTimeout(this.wrongT);
      this.wrongT = setTimeout(() => this.setState({ wrong: '' }), 420);
    }
  }
  nextPage() {
    this.setState({ flipping: true });
    setTimeout(() => { this.newPage(); this.setState({ pageNum: this.state.pageNum + 1 }); }, 260);
    setTimeout(() => this.setState({ flipping: false }), 560);
  }
  setMode(m) {
    this.setState({ mode: m, streak: 0 });
    this.newPage();
  }
  openReveal() {
    let rot = [0, 0, 0, 0, 0, 0, 0, 0, 0].map(() => 1 + Math.floor(Math.random() * 3));
    rot = rot.map((r, i) => (Math.random() < 0.2 ? 0 : r));
    rot[4] = 1;
    this.setState({ reveal: 'puzzle', rot: rot, turns: 0, revealN: 0 });
  }
  turnPiece(i) {
    const s = this.state;
    if (s.reveal !== 'puzzle') return;
    const rot = s.rot.slice();
    rot[i] += 1;
    const solved = rot.every((r, k) => (k === 4 ? r % 2 === 0 : r % 4 === 0));
    this.setState({ rot: rot, turns: s.turns + 1 });
    if (solved) {
      setTimeout(() => {
        this.setState({ reveal: 'solved', revealN: 0 });
        let n = 0;
        clearInterval(this.letterT);
        this.letterT = setInterval(() => { n++; this.setState({ revealN: n }); if (n >= 5) clearInterval(this.letterT); }, 380);
      }, 260);
    }
  }
  finishReveal() {
    this.setState({ reveal: '', learned: true, ink: 0 });
    this.nextPage();
  }
  revealVals() {
    const s = this.state;
    const ready = s.ink >= 100 && !s.learned;
    const solved = s.reveal === 'solved';
    const pieces = s.rot.map((r, i) => {
      const x = (i % 3) * 33.333, y = Math.floor(i / 3) * 33.333;
      return { vb: x.toFixed(3) + ' ' + y.toFixed(3) + ' 33.333 33.333', pick: () => this.turnPiece(i), label: 'Rune piece ' + (i + 1) + ', tap to turn',
        inner: 'width:100%;height:100%;transform:rotate(' + (r * 90) + 'deg);transition:transform 220ms cubic-bezier(.3,1.5,.5,1);',
        style: 'width:100%;height:100%;padding:0;display:block;overflow:hidden;background:rgba(255,250,236,0.5);transition:border-radius 300ms ease;border-radius:' + (solved ? '0' : '8px') + ';border:' + (solved ? 'none' : '2px solid rgba(122,84,40,0.5)') + ';' };
    });
    const letters = 'TELE'.split('').map((c, i) => ({ c: c, style: 'display:inline-block;transition:opacity 300ms ease, transform 300ms ease;opacity:' + (s.revealN > i ? 1 : 0) + ';transform:translateY(' + (s.revealN > i ? 0 : 10) + 'px);' }));
    return {
      doneLabel: ready ? 'Decipher the word' : 'Turn the page',
      doneAction: ready ? () => this.openReveal() : () => this.nextPage(),
      doneBtnStyle: 'min-height:48px;padding:0 24px;border-radius:10px;border:none;font-family:Cinzel, serif;font-size:17px;font-weight:700;' + (ready ? 'background:#8F5A0F;color:#FFF8E7;box-shadow:0 5px 0 #5A3708, 0 0 18px rgba(143,90,15,0.45);' : 'background:#7A1F2B;color:#FFF3E0;box-shadow:0 5px 0 #4A1019;'),
      hasDawn: s.dawn && s.done, dawnText: 'Understanding dawns: TELE means Teleport.',
      revealStyle: 'position:absolute;left:0;top:0;width:100%;height:100%;box-sizing:border-box;background-color:#EAD7AE;padding:28px 20px 20px;z-index:5;display:flex;flex-direction:column;align-items:center;gap:12px;transition:opacity 300ms ease;' + (s.reveal ? 'opacity:1;pointer-events:auto;' : 'opacity:0;pointer-events:none;'),
      revealKicker: solved ? 'A NEW WORD' : 'AN UNKNOWN WORD',
      revealTitle: solved ? 'The rune is whole' : 'Align the rune',
      revealSub: solved ? 'Its name rises from the ink.' : 'Tap a piece to turn it. Make the rune whole.',
      pieces: pieces,
      boardStyle: 'width:300px;height:300px;flex:0 0 auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));transition:gap 400ms ease, filter 500ms ease;gap:' + (solved ? '0' : '6px') + ';' + (solved ? 'filter:drop-shadow(0 0 12px rgba(31,92,138,0.5));' : ''),
      pieceStroke: solved ? '#1F5C8A' : '#5E4128',
      turnsText: solved ? 'Solved in ' + s.turns + ' turns' : 'Turns: ' + s.turns,
      isSolved: solved, letters: letters, showCard: solved && s.revealN >= 5,
      finishReveal: () => this.finishReveal()
    };
  }
  studyVals() {
    const s = this.state;
    const R = this.runeData();
    const slots = s.slots.map((n, i) => {
      const r = R[n];
      const f = s.filled[i];
      const on = i === s.cur && !s.done;
      let op = '1';
      if (!f && s.mode === 'copy') op = '0.18';
      if (!f && s.mode === 'recall') op = '0';
      return { glyph: r.glyph, frame: r.frame, color: r.color, cls: f && s.last === i ? 'inked' : '',
        svgStyle: 'width:64px;height:64px;opacity:' + op + ';transition:opacity 260ms ease;' + (f ? 'filter:drop-shadow(0 0 5px ' + r.color + '88);' : ''),
        top: s.mode === 'read' && !f ? '·' : r.en,
        bottom: f ? r.name : (s.mode === 'read' ? '? ? ?' : '·'),
        nameStyle: 'font-family:Cinzel, serif;font-weight:700;font-size:17px;min-height:20px;color:' + (f ? r.color : '#7A6347') + ';',
        box: 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-radius:6px;transition:border-color 200ms ease, background 200ms ease;' +
          (on ? 'border:2px dashed #7A1F2B;background:rgba(122,31,43,0.07);' : f ? 'border:2px solid ' + r.color + '88;background:' + r.color + '14;' : 'border:2px solid rgba(122,84,40,0.28);background:transparent;') };
    });
    const used = s.slots.slice(0, s.cur);
    const tiles = s.tiles.map((n) => {
      const r = R[n];
      const u = used.indexOf(n) !== -1;
      const bad = s.wrong === n;
      return { name: n, glyph: r.glyph, frame: r.frame, color: r.color, showRune: s.mode !== 'read', showName: s.mode === 'read',
        cls: 'press' + (bad ? ' shake' : ''), pick: () => this.tapTile(n),
        style: 'height:84px;border-radius:8px;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#3B2414;font-family:Cinzel, serif;font-weight:700;font-size:16px;box-shadow:0 4px 0 #8C6A3C;transition:opacity 200ms ease;' +
          (bad ? 'border:2px solid #B3261E;background:#F3D3C8;' : 'border:2px solid #A2804F;background:#F6EBD0;') + (u ? 'opacity:0.3;' : '') };
    });
    const modes = [['copy', 'Copy'], ['recall', 'Recall'], ['read', 'Read']].map((m) => ({ label: m[1], pick: () => this.setMode(m[0]),
      style: 'min-height:44px;border-radius:12px;font-size:13px;font-weight:600;' + (s.mode === m[0] ? 'background:#A78BFA;color:#0B0910;border:2px solid #A78BFA;box-shadow:0 0 14px rgba(167,139,250,0.4);' : 'background:transparent;color:#A39CB2;border:2px solid #2E2838;') }));
    const mult = Math.min(3, 1 + Math.floor(s.streak / 3) * 0.5);
    const shown = Math.floor(s.ink / 25);
    return Object.assign({
      modeTitle: { copy: 'Copy', recall: 'Recall', read: 'Read' }[s.mode],
      studyPlace: (s.placeAt || 'A quiet library').toUpperCase(),
      pageNum: s.pageNum, sxp: '+' + s.xp + ' XP',
      modes: modes,
      modeHint: { copy: 'Match each faded rune.', recall: 'From memory: find each word’s rune.', read: 'Read each rune: pick its name.' }[s.mode],
      streakText: 'Streak ' + s.streak + ' · ×' + mult,
      streakStyle: 'font-family:Cinzel, serif;font-size:13px;font-weight:700;white-space:nowrap;' + (mult > 1 ? 'color:#7A1F2B;' : 'color:#5E4128;'),
      pageSlots: slots, tiles: tiles, pageClass: s.flipping ? 'turn' : '',
      pageDone: s.done, tallyXp: '+' + s.pageXp + ' XP',
      tallyNote: s.ink >= 100 ? (s.learned ? 'Another word is complete. Its puzzle comes in a later build.' : 'The unknown word is complete. Decipher it now.') : 'Ink gathered toward an unknown word.',
      hasMargin: !!s.margin, margin: s.margin,
      ink: s.ink,
      inkLetters: (s.learned ? 'VOLA' : 'TELE').split('').map((c, i) => (i < shown ? c : '·')).join(' '),
      inkBar: 'height:100%;border-radius:4px;background:#7A1F2B;transition:width 500ms ease;width:' + s.ink + '%;',
      nextPage: () => this.nextPage(), closeStudy: () => this.closeStudy()
    }, this.tomeVals());
  }
  tomeVals() {
    const s = this.state;
    const p = s.tome;
    const has = (arr) => arr.indexOf(p) !== -1;
    const hide = 'display:none;';
    const full = 'position:absolute;left:0;top:0;width:100%;height:100%;box-sizing:border-box;';
    const stageOn = has(['arrive', 'opening', 'flip', 'dive', 'close1', 'close2', 'close3']);
    const coverOn = has(['arrive', 'opening', 'close2', 'close3']);
    const spreadOn = has(['opening', 'flip', 'dive', 'close1', 'close2']);
    const menuOn = has(['dive', 'menu', 'turn', 'unturn']) || (p === 'close1' && s.tomeFrom === 'menu');
    const gameOn = has(['turn', 'unturn', 'game']) || (p === 'close1' && s.tomeFrom === 'game');
    const leaves = [];
    for (let i = 0; i < 6; i++) {
      leaves.push({ s: 'position:absolute;left:161px;top:41px;width:119px;height:164px;animation-delay:' + (i * 165) + 'ms;' + (i === 5 ? 'animation-duration:560ms;' : '') });
    }
    const items = [
      ['copy', 'Copy', 'Trace each faded rune.', 'assets/tome/icon-copy.png'],
      ['recall', 'Recall', 'Find each rune from memory.', 'assets/tome/icon-recall.png'],
      ['read', 'Read', 'Name each rune you see.', 'assets/tome/icon-read.png'],
      ['close', 'Close Tome', 'Return to the library.', 'assets/tome/icon-close.png']
    ];
    const menuItems = items.map((it) => {
      const isClose = it[0] === 'close';
      const cur = it[0] === s.mode && s.slots.length && !isClose;
      return { name: it[1], desc: it[2], icon: it[3],
        pick: isClose ? () => this.closeTome() : () => this.pickLesson(it[0]),
        nameStyle: 'font-family:Cinzel Decorative, serif;font-size:22px;font-weight:700;line-height:1.1;color:' + (isClose ? '#7A1F2B' : '#3B2414') + ';',
        style: 'width:100%;min-height:84px;box-sizing:border-box;display:flex;align-items:center;gap:14px;padding:10px 14px 10px 10px;border-radius:8px;' +
          (isClose ? 'margin-top:6px;border:2px solid rgba(122,31,43,0.45);background:rgba(122,31,43,0.06);' : 'border:2px solid ' + (cur ? 'rgba(122,31,43,0.6)' : 'rgba(122,84,40,0.4)') + ';background:rgba(255,250,236,' + (cur ? '0.55' : '0.32') + ');') };
    });
    return {
      tomeRoot: full + 'z-index:4;overflow:hidden;' + (p ? 'pointer-events:auto;' : 'pointer-events:none;visibility:hidden;'),
      tomeScrim: full + 'background:radial-gradient(circle at 50% 46%, #4a2a1a 0%, #1a0f14 48%, #07050a 100%);transition:opacity 480ms ease;opacity:' + (p && p !== 'close3' ? '1' : '0') + ';',
      stageCls: p === 'dive' ? 'diveIn' : (p === 'close3' ? 'coverAway' : ''),
      stageStyle: 'position:absolute;left:35px;top:290px;width:320px;height:260px;' + (stageOn ? '' : hide),
      spreadCls: p === 'opening' ? 'spreadIn' : (p === 'close2' ? 'spreadOut' : ''),
      spreadStyle: 'position:absolute;left:0;top:20px;width:320px;height:220px;filter:drop-shadow(0 18px 18px rgba(0,0,0,0.55));' + (spreadOn ? '' : hide),
      leavesOn: p === 'flip', leaves: leaves,
      coverCls: { arrive: 'tomeIn', opening: 'coverOpen', close2: 'coverClose' }[p] || '',
      coverStyle: 'position:absolute;left:60px;top:0;width:200px;height:260px;filter:drop-shadow(0 18px 18px rgba(0,0,0,0.6));' + (coverOn ? '' : hide),
      glowStyle: 'position:absolute;left:85px;top:65px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle, rgba(255,196,90,0.55) 0%, rgba(255,160,60,0) 70%);pointer-events:none;' + (p === 'arrive' ? '' : hide),
      wrapCls: p === 'dive' ? 'parchIn' : (p === 'close1' ? 'parchOut' : ''),
      wrapStyle: full + (menuOn || gameOn ? '' : hide),
      gameStyle: full + 'padding:16px 16px 18px;display:flex;flex-direction:column;gap:12px;' + (gameOn ? '' : hide),
      menuCls: 'parch' + (p === 'turn' ? ' pageOut' : (p === 'unturn' ? ' pageIn' : '')),
      menuStyle: full + 'padding:18px 22px;display:flex;flex-direction:column;justify-content:space-between;' + (menuOn ? '' : hide),
      menuItems: menuItems,
      toContents: () => this.toContents(),
      closeTome: () => this.closeTome()
    };
  }
  box(l, t, w, h, bg, extra, c) {
    return { c: c || '', s: 'position:absolute;left:' + l + 'px;top:' + t + 'px;width:' + w + 'px;height:' + h + 'px;background:' + bg + ';' + (extra || '') };
  }
  locs() {
    const b = this.box.bind(this);
    const roof = 'clip-path:polygon(0% 32%,50% 0%,100% 32%,100% 100%,0% 100%);';
    const cap = 'clip-path:polygon(50% 0%,100% 100%,72% 78%,50% 100%,28% 78%,0% 100%);';
    const tri = 'clip-path:polygon(50% 0%,100% 100%,0% 100%);';
    const glow = 'box-shadow:0 0 12px #f5b544;';
    const stars = [[30, 30], [80, 64], [140, 22], [192, 84], [232, 44], [322, 118], [58, 142], [170, 150], [112, 104], [300, 176], [20, 200], [210, 196]].map((p, i) => b(p[0], p[1], 3, 3, '#ffffff', 'animation-delay:' + (i * 0.3) + 's;', 'twinkle'));
    return [
      { place: 'Mossgate Shrine', region: 'Ashen Vale', n: 1, day: 3, start: 1092, accent: '#F5B544',
        sky: ['#2b1d3f', '#4a2a4f', '#7a3b52', '#c4614f', '#f2a65a'], ground: '#231d26', edge: '#3a2f36',
        shapes: [
          b(214, 236, 60, 60, '#ffcf7a', 'border-radius:50%;box-shadow:0 0 40px #ffb45a;'),
          b(0, 200, 430, 140, '#4a2c4c', 'clip-path:polygon(0% 60%,15% 20%,27% 55%,42% 10%,57% 50%,70% 25%,84% 55%,100% 30%,100% 100%,0% 100%);'),
          b(0, 270, 430, 70, '#2a2430', 'clip-path:polygon(0% 40%,21% 10%,46% 45%,67% 15%,84% 35%,100% 20%,100% 100%,0% 100%);'),
          b(26, 232, 16, 108, '#17131c'), b(18, 222, 32, 12, '#17131c'), b(56, 268, 16, 72, '#17131c'),
          b(304, 252, 16, 88, '#17131c'), b(298, 244, 28, 10, '#17131c'), b(380, 280, 16, 60, '#17131c')
        ] },
      { place: 'Thornwood Hollow', region: 'Verdant Reach', n: 2, day: 5, start: 460, accent: '#4ADE80',
        sky: ['#cdeee6', '#ade3d6', '#8fd5c3', '#72c2ab', '#5aa991'], ground: '#2f5a33', edge: '#4c8a45',
        shapes: [
          b(150, 30, 44, 44, '#fff6d2', 'border-radius:50%;box-shadow:0 0 30px #fff3b8;'),
          b(0, 180, 430, 160, '#3f8a6c', 'clip-path:polygon(0% 100%,0% 50%,5% 20%,10% 50%,15% 15%,20% 50%,25% 25%,30% 50%,35% 10%,40% 50%,45% 20%,50% 50%,55% 15%,60% 50%,65% 25%,70% 50%,75% 15%,80% 50%,85% 20%,90% 50%,95% 15%,100% 40%,100% 100%);'),
          b(120, 0, 100, 340, 'rgba(255,255,240,0.12)', 'clip-path:polygon(30% 0%,60% 0%,100% 100%,55% 100%);'),
          b(-30, 110, 130, 230, '#174536', tri),
          b(268, 140, 130, 200, '#1c5240', tri), b(380, 170, 110, 170, '#174536', tri)
        ] },
      { place: 'Kesh Pass', region: 'Ironcrown Peaks', n: 3, day: 9, start: 725, accent: '#7DD3FC',
        sky: ['#6fbfee', '#86caf1', '#9fd5f4', '#b9e1f7', '#d3ecf9'], ground: '#e6edf5', edge: '#c3d1e3',
        shapes: [
          b(0, 120, 358, 220, '#56658a', 'clip-path:polygon(0% 100%,0% 60%,20% 15%,38% 55%,58% 0%,78% 45%,100% 20%,100% 100%);'),
          b(56, 153, 32, 22, '#f4f8fc', cap), b(190, 120, 36, 27, '#f4f8fc', cap), b(340, 164, 36, 24, '#f4f8fc', cap),
          b(358, 180, 120, 160, '#56658a', 'clip-path:polygon(0% 10%,40% 50%,70% 20%,100% 60%,100% 100%,0% 100%);'),
          b(0, 250, 430, 90, '#3e4a68', 'clip-path:polygon(0% 50%,25% 20%,50% 60%,70% 30%,85% 50%,100% 25%,100% 100%,0% 100%);'),
          b(40, 328, 30, 14, '#8796b0', 'border-radius:4px 4px 0 0;'), b(290, 324, 40, 18, '#8796b0', 'border-radius:6px 6px 0 0;'), b(390, 328, 26, 14, '#8796b0', 'border-radius:4px 4px 0 0;')
        ] },
      { place: 'Saltmarrow Village', region: 'Gilded Coast', n: 4, day: 12, start: 1290, accent: '#A78BFA',
        sky: ['#090d22', '#0f1634', '#152048', '#1c2a5c', '#243670'], ground: '#1a1630', edge: '#2b2547',
        shapes: stars.concat([
          b(266, 40, 44, 44, '#f3ecd2', 'border-radius:50%;box-shadow:0 0 24px rgba(243,236,210,0.35);'),
          b(279, 32, 44, 44, '#090d22', 'border-radius:50%;'),
          b(0, 282, 430, 58, '#1b2a63'),
          b(250, 294, 40, 3, 'rgba(245,181,68,0.55)'), b(262, 306, 24, 3, 'rgba(245,181,68,0.4)'), b(60, 300, 30, 3, 'rgba(245,181,68,0.35)'),
          b(8, 232, 84, 108, '#0a0c1a', roof), b(26, 280, 12, 14, '#f5b544', glow), b(60, 280, 12, 14, '#f5b544', glow),
          b(276, 248, 74, 92, '#0a0c1a', roof), b(306, 290, 12, 14, '#f5b544', glow),
          b(372, 256, 64, 84, '#0a0c1a', roof), b(398, 292, 12, 14, '#f5b544', glow)
        ]) }
    ];
  }
  interior(act) {
    const b = this.box.bind(this);
    if (act === 'study') {
      const shapes = [b(0, 40, 96, 290, '#24170f'), b(262, 40, 96, 290, '#24170f'),
        b(139, 40, 80, 130, '#2c3d63', 'border-radius:40px 40px 0 0;'), b(177, 40, 4, 130, '#24170f'), b(139, 100, 80, 4, '#24170f'),
        b(160, 60, 6, 6, '#e8eefc', 'box-shadow:0 0 10px #e8eefc;')];
      const cols = ['#8b2f45', '#3b5b8c', '#6b8f3a', '#b8862f', '#5a3d7a', '#2f6f6a'];
      [50, 120, 190, 260].forEach((y, ri) => {
        [[6, 90], [268, 352]].forEach((r, side) => {
          let x = r[0], k = ri * 3 + side * 2;
          while (x < r[1] - 8) {
            const w = 8 + ((k * 7) % 5), h = 38 + ((k * 13) % 16);
            shapes.push(b(x, y + 56 - h, w, h, cols[k % cols.length]));
            x += w + 2; k++;
          }
          shapes.push(b(r[0] - 6, y + 56, r[1] - r[0] + 12, 6, '#5a3f2a'));
        });
      });
      return { sky: ['#2a1d17', '#2e2019', '#32231b', '#36261d', '#3a291f'], ground: '#3a2a1f', edge: '#4d3727', shapes: shapes,
        props: [
          b(134, 196, 92, 42, '#6b2f45', 'border-radius:4px;'),
          b(138, 190, 42, 40, '#f3ead2'), b(180, 190, 42, 40, '#f3ead2'),
          b(144, 198, 30, 2, '#b9ab8a'), b(144, 205, 26, 2, '#b9ab8a'), b(144, 212, 28, 2, '#b9ab8a'),
          b(186, 198, 30, 2, '#b9ab8a'), b(186, 205, 24, 2, '#b9ab8a'),
          b(180, 190, 42, 40, '#e6dcc0', '', 'flip'),
          b(160, 180, 4, 4, '#C4B5FD', 'box-shadow:0 0 8px #A78BFA;', 'rise'),
          b(198, 184, 4, 4, '#C4B5FD', 'box-shadow:0 0 8px #A78BFA;animation-delay:.7s;', 'rise'),
          b(178, 176, 3, 3, '#E4DBFF', 'box-shadow:0 0 8px #A78BFA;animation-delay:1.3s;', 'rise')
        ] };
    }
    if (act === 'smithing') {
      const shapes = [];
      [40, 74, 108, 142, 176, 210, 244, 278, 312].forEach((y, i) => {
        shapes.push(b(0, y, 358, 2, '#1a1314'));
        for (let x = (i % 2) * 30; x < 358; x += 60) shapes.push(b(x, y + 2, 2, 32, '#1a1314'));
      });
      shapes.push(b(262, 150, 96, 190, '#17100f', 'border-radius:48px 48px 0 0;'),
        b(282, 232, 56, 60, '#f2762e', 'border-radius:28px 28px 0 0;box-shadow:0 0 40px #f2762e;', 'flicker'),
        b(296, 252, 28, 40, '#ffd27a', 'border-radius:14px 14px 0 0;', 'flicker'),
        b(16, 190, 70, 6, '#5a3f2a'), b(28, 196, 4, 40, '#7a808c'), b(50, 196, 4, 52, '#7a808c'), b(70, 196, 4, 36, '#7a808c'));
      return { sky: ['#241c1d', '#2a2021', '#302526', '#372a2b', '#3e2f2f'], ground: '#2b2222', edge: '#3d302e', shapes: shapes,
        props: [
          b(129, 250, 100, 20, '#5b616e', 'border-radius:4px 16px 4px 4px;'), b(152, 270, 54, 52, '#454a55'), b(136, 322, 86, 14, '#3a3e47'),
          b(150, 244, 50, 7, '#ffb45a', 'box-shadow:0 0 12px #ff8a3a;', 'flicker'),
          b(106, 165, 6, 52, '#8a5a34', 'transform-origin:3px 52px;', 'swing'),
          b(96, 160, 26, 16, '#7a808c', 'border-radius:3px;transform-origin:13px 57px;', 'swing'),
          b(166, 238, 4, 4, '#ffd27a', '', 'sparkA'), b(172, 236, 3, 3, '#ffb45a', '', 'sparkB'), b(162, 240, 3, 3, '#fff1c9', '', 'sparkC')
        ] };
    }
    if (act === 'mining') {
      return { sky: ['#17141c', '#1c1822', '#211c28', '#26202e', '#2c2535'], ground: '#221d28', edge: '#332b3b',
        shapes: [
          b(0, 0, 358, 90, '#120f16', 'clip-path:polygon(0% 0%,100% 0%,100% 60%,85% 90%,70% 55%,55% 100%,40% 60%,25% 85%,10% 50%,0% 70%);'),
          b(0, 60, 80, 280, '#1a1620', 'clip-path:polygon(0% 0%,80% 20%,100% 60%,70% 100%,0% 100%);'),
          b(278, 60, 80, 280, '#1a1620', 'clip-path:polygon(100% 0%,20% 25%,0% 60%,30% 100%,100% 100%);'),
          b(96, 60, 12, 280, '#5a3f2a'), b(250, 60, 12, 280, '#5a3f2a'), b(90, 54, 178, 12, '#6b4a30'),
          b(178, 66, 2, 22, '#555'), b(172, 88, 14, 18, '#f5b544', 'border-radius:3px;box-shadow:0 0 30px #f5b544;', 'flicker')
        ],
        props: [
          b(236, 250, 100, 94, '#3a3344', 'clip-path:polygon(10% 30%,40% 0%,80% 10%,100% 50%,100% 100%,0% 100%);'),
          b(264, 272, 8, 8, '#7DD3FC', 'box-shadow:0 0 10px #7DD3FC;', 'flicker'),
          b(292, 290, 6, 6, '#f5b544', 'box-shadow:0 0 8px #f5b544;'), b(274, 308, 6, 6, '#7DD3FC', 'box-shadow:0 0 8px #7DD3FC;'),
          b(231, 162, 6, 56, '#8a5a34', 'transform-origin:3px 53px;', 'chop'),
          b(211, 156, 46, 10, '#9aa3b5', 'border-radius:50% 50% 0 0;transform-origin:23px 59px;', 'chop'),
          b(262, 262, 5, 5, '#8a8396', '', 'sparkA'), b(270, 266, 4, 4, '#7DD3FC', '', 'sparkB'), b(258, 268, 4, 4, '#6b6478', '', 'sparkC')
        ] };
    }
    return { sky: ['#1c2620', '#202b24', '#243028', '#28352c', '#2d3b31'], ground: '#2a2219', edge: '#3b3024',
      shapes: [
        b(20, 120, 60, 70, '#3d5a4a', 'border-radius:6px;'), b(48, 120, 4, 70, '#1c2620'), b(20, 152, 60, 4, '#1c2620'),
        b(110, 0, 2, 40, '#5a3f2a'), b(104, 38, 14, 22, '#4ADE80', 'border-radius:0 0 7px 7px;'),
        b(150, 0, 2, 30, '#5a3f2a'), b(144, 28, 14, 26, '#a3c95a', 'border-radius:0 0 7px 7px;'),
        b(220, 0, 2, 44, '#5a3f2a'), b(214, 42, 14, 22, '#c07ad9', 'border-radius:0 0 7px 7px;'),
        b(262, 196, 96, 6, '#5a3f2a'), b(272, 172, 16, 24, '#3b5b8c', 'border-radius:3px;'), b(294, 166, 14, 30, '#8b2f45', 'border-radius:3px;'), b(316, 176, 18, 20, '#b8862f', 'border-radius:3px;')
      ],
      props: [
        b(100, 262, 160, 14, '#6b4426', 'border-radius:3px;'), b(110, 276, 10, 64, '#4a2f1a'), b(240, 276, 10, 64, '#4a2f1a'),
        b(168, 256, 24, 5, '#f2762e', 'box-shadow:0 0 10px #f2762e;', 'flicker'),
        b(174, 204, 12, 24, 'rgba(220,240,230,0.45)'),
        b(160, 222, 40, 36, '#4ADE80', 'border-radius:50%;box-shadow:0 0 18px rgba(74,222,128,0.6);', 'flicker'),
        b(177, 204, 5, 5, '#C9F7D9', 'border-radius:50%;', 'bubble'), b(181, 210, 4, 4, '#C9F7D9', 'border-radius:50%;animation-delay:.5s;', 'bubble'), b(175, 212, 3, 3, '#C9F7D9', 'border-radius:50%;animation-delay:.9s;', 'bubble'),
        b(122, 244, 10, 18, '#A78BFA', 'border-radius:2px;'), b(226, 240, 12, 22, '#F2546B', 'border-radius:2px;')
      ] };
  }
  sprite() {
    const s = this.state;
    const working = s.view === 'activity';
    const rows = [
      '........RRR.........',
      '.......KRRRK........',
      '......KHHHHHK.......',
      '.....KHHHHHHHK......',
      '.....KHhHHHhHK......',
      '.....KHSSSSSHK......',
      '.....KHSESESHK......',
      '.....KHSSSSSHK......',
      '......KSSSSSK.......',
      '.......KSSSK........',
      '...KHHKAAGAAKHHK....',
      '..KHHHKAAGAAKHHHK...',
      '..KKKKAAAGAAAKGGGGGK',
      '..KAK.KAAGAAKKGCCCGK',
      '..KAK.KAAGAAKKGCGCGK',
      '..KAK.KBBGBBKKGCCCGK',
      '..KSK.KAAAAAK.KGCGK.',
      '..KSK.KAAKAAK..KGK..',
      '.KGGGKKLLKLLK.......',
      '..KWK.KLLKLLK.......',
      '..KWK.KLLKLLK.......',
      '..KWK.KLLKLLK.......',
      '..KWK.KLLKLLK.......',
      '..KWK.KLLKLLK.......',
      '..KWK.KOOKOOK.......',
      '...K..KOOKOOK.......',
      '......KOOKOOK.......',
      '.....KOOOKOOOK......',
      '.....KKKKKKKKK......'
    ];
    const noShield = { 12: 'KKKK...', 13: '.KAK...', 14: '.KAK...', 15: '.KAK...', 16: '.KSK...', 17: '.KSK...' };
    const armor = { leather: '#8a5a34', steel: '#3b5b8c', ember: '#b23a54' }[s.armor];
    const col = { K: '#1a1420', H: '#a7b0c2', h: '#6f788c', S: '#e8a97e', E: '#1a1420', A: armor, G: '#f5b544', C: '#e0485f', B: '#6b4426', L: '#3d3350', O: '#5c3b22', W: '#e6ebf2', R: '#f2546b' };
    const out = [];
    rows.forEach((r, i) => {
      let row = ((!s.shield || working) && noShield[i]) ? r.slice(0, 13) + noShield[i] : r;
      if (working && i >= 18 && i <= 25) row = '......' + row.slice(6);
      for (let j = 0; j < 20; j++) {
        const c = row.charAt(j);
        out.push({ s: 'background:' + (c === '.' || !col[c] ? 'transparent' : col[c]) });
      }
    });
    return out;
  }
  renderVals() {
    const s = this.state;
    const L = this.locs()[s.loc];
    const A = this.acts();
    const inAct = s.view === 'activity';
    const scene = inAct ? this.interior(s.act) : L;
    const actA = inAct ? A[s.act] : A.study;
    const rc = { common: '#A39CB2', uncommon: '#4ADE80', epic: '#A78BFA', legendary: '#F5B544', mythic: '#FF6B9A', none: '#5A5366' };
    const m = s.minutes;
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    const phase = hh >= 5 && hh < 8 ? 'Dawn' : hh >= 8 && hh < 12 ? 'Morning' : hh >= 12 && hh < 17 ? 'Afternoon' : hh >= 17 && hh < 20 ? 'Dusk' : 'Night';
    const isNight = hh < 6 || hh >= 19;
    const pct = (m / 1440 * 100).toFixed(2);

    const inv = [
      ['Wolfsbane', 4, 'common', 'A bitter purple bloom. Alchemists pay well for it fresh.'],
      ['Iron Ore', 12, 'common', 'Dull, heavy, honest. The backbone of any forge.'],
      ['Healing Draught', 3, 'uncommon', 'Restores 15 vitality. Tastes faintly of pine.'],
      ['Troll Hide', 2, 'uncommon', 'Thick enough to turn a blade. Smells worse than it looks.'],
      ['Faded Tome', 1, 'epic', 'Most pages are water-stained. One margin holds half a root word: KE…'],
      ['Moonsilver Ingot', 1, 'legendary', 'Cool to the touch even in sunlight. Takes enchantments deeply.'],
      ['Shard of the First Crown', 1, 'mythic', 'It hums when you face north. The old histories say there were seven.'],
      ['Spare Dagger', 1, 'common', 'Plain and dependable.']
    ];
    const items = [];
    for (let i = 0; i < 16; i++) {
      const it = inv[i];
      if (it) {
        const c = rc[it[2]];
        const on = s.sel === i;
        items.push({ name: it[0], qty: it[1] > 1 ? '×' + it[1] : '', label: it[0] + ', ' + it[2],
          pick: () => this.setState({ sel: i }),
          style: 'aspect-ratio:1/1;min-height:44px;box-sizing:border-box;border-radius:12px;padding:6px;display:flex;flex-direction:column;justify-content:space-between;text-align:left;color:#EDE8F5;background:' + c + '1F;border:2px solid ' + c + ';transition:transform 90ms ease, box-shadow 160ms ease;' + (on ? 'box-shadow:0 0 16px ' + c + 'AA;transform:scale(1.04);' : '') });
      } else {
        items.push({ name: '', qty: '', label: 'Empty slot', pick: () => {}, style: 'aspect-ratio:1/1;min-height:44px;box-sizing:border-box;border-radius:12px;background:transparent;border:2px dashed #2E2838;padding:0;' });
      }
    }
    const sel = inv[s.sel] || inv[0];

    const armorOpts = [
      { id: 'leather', name: 'Worn Leather Jerkin', rar: 'common' },
      { id: 'steel', name: 'Vale Steel Cuirass', rar: 'uncommon' },
      { id: 'ember', name: 'Emberweave Mail', rar: 'epic' }
    ];
    const chest = armorOpts.filter((a) => a.id === s.armor)[0];
    const armors = armorOpts.map((a) => {
      const on = a.id === s.armor;
      const c = rc[a.rar];
      return { name: a.name, tag: on ? 'EQUIPPED' : a.rar.toUpperCase(), pick: () => this.setState({ armor: a.id }),
        style: 'min-height:44px;border-radius:12px;padding:0 14px;display:flex;justify-content:space-between;align-items:center;font-size:13px;' +
          (on ? 'background:' + c + ';color:#0B0910;border:2px solid ' + c + ';font-weight:600;box-shadow:0 3px 0 rgba(0,0,0,0.5);' : 'background:#1A1622;color:' + c + ';border:2px solid ' + c + '55;box-shadow:0 3px 0 rgba(0,0,0,0.5);') };
    });
    const slotData = [
      ['HEAD', 'Iron Half-Helm', 'common'],
      ['CHEST', chest.name, chest.rar],
      ['MAIN HAND', 'Vale Shortsword', 'uncommon'],
      ['OFF HAND', s.shield ? 'Crimson Kite Shield' : 'Empty', s.shield ? 'uncommon' : 'none'],
      ['RING', 'Ring of Quiet Steps', 'epic'],
      ['AMULET', 'Empty', 'none']
    ];
    const slots = slotData.map((d) => ({ slot: d[0], name: d[1], style: 'font-size:12.5px;font-weight:600;color:' + rc[d[2]] + ';' }));

    const isStudyPick = s.sheet === 'study', isCraftPick = s.sheet === 'craft';
    const pickAccent = isStudyPick ? '#A78BFA' : '#F5B544';
    const pickShadow = isStudyPick ? '#5B45A8' : '#9A6A1A';
    const opts = isStudyPick ? this.studyOpts() : this.craftOpts();
    const pIdx = isStudyPick ? s.pickStudy : s.pickCraft;
    const pickOpts = opts.map((o, i) => {
      const on = i === pIdx;
      const here = s.placeAt === o.name;
      const c = A[o.act].accent;
      return { title: o.title, sub: o.sub, time: here ? "You're here" : this.dur(o.mins),
        pick: () => this.setState(isStudyPick ? { pickStudy: i } : { pickCraft: i }),
        style: 'width:100%;min-height:64px;box-sizing:border-box;text-align:left;border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;gap:4px;box-shadow:0 3px 0 rgba(0,0,0,0.5);' +
          (on ? 'background:' + c + '22;border:2px solid ' + c + ';color:#EDE8F5;box-shadow:0 0 16px ' + c + '44, 0 3px 0 rgba(0,0,0,0.5);' : 'background:#1A1622;border:2px solid #2E2838;color:#C9C2D6;') };
    });
    const chosen = opts[pIdx] || opts[0];
    const goHere = s.placeAt === chosen.name;

    const sheets = { bag: ['Inventory', '#F5B544'], gear: ['Equipment', '#7DD3FC'], stats: ['Character', '#4ADE80'], quests: ['Quests', '#A78BFA'], study: ['Where to study?', '#A78BFA'], craft: ['Which profession?', '#F5B544'] };
    const sh = sheets[s.sheet] || ['', '#2E2838'];
    const open = !!s.sheet;
    const sheetH = (isStudyPick || isCraftPick) ? (isStudyPick ? 380 : 470) : 640;

    const tufts = [];
    for (let x = 0; x < 440; x += 40) tufts.push({ s: 'position:absolute;left:' + x + 'px;top:' + ((x / 40) % 2 ? 22 : 6) + 'px;width:12px;height:3px;background:' + L.edge + ';' });

    return Object.assign(this.studyVals(), this.revealVals(), {
      accent: L.accent, region: L.region, regionNum: L.n, day: L.day,
      place: inAct || s.view === 'travel' ? (inAct ? s.placeAt : 'On the road') : (s.placeAt || L.place),
      topHint: s.view === 'home' ? 'Tap to preview another region' : (inAct ? 'Working' : 'Traveling'),
      time: ((hh + 11) % 12 + 1) + ':' + (mm < 10 ? '0' : '') + mm, ampm: hh < 12 ? 'AM' : 'PM',
      phase: phase, isNight: isNight, isDay: !isNight,
      dayFill: 'position:absolute;left:0;top:0;height:100%;width:' + pct + '%;background:' + L.accent + '55;border-radius:4px;',
      dayMarker: 'position:absolute;top:-3px;left:calc(' + pct + '% - 7px);width:14px;height:14px;border-radius:3px;background:' + L.accent + ';box-shadow:0 0 10px ' + L.accent + ';',
      sky: scene.sky.map((c) => ({ s: 'flex:1 1 0;background:' + c + ';' })),
      shapes: scene.shapes, props: inAct ? scene.props : [],
      shapesClass: s.view === 'travel' ? 'scrollL' : '',
      spriteClass: s.view === 'travel' ? 'walking' : 'idle',
      ground: 'position:absolute;left:0;top:344px;width:100%;height:78px;background:' + scene.ground + ';',
      groundEdge: 'position:absolute;left:0;top:338px;width:100%;height:6px;background:' + scene.edge + ';',
      tufts: tufts,
      pixels: this.sprite(),
      isHome: s.view === 'home', isTraveling: s.view === 'travel', isActivity: inAct, isSmith: inAct && s.act === 'smithing',
      travelTo: s.travelTo, travelNote: 'Time passes as you walk · arriving ' + s.travelArrive,
      travelBar: 'height:100%;border-radius:5px;background:' + (s.sheet === '' ? '#2DD4BF' : '#2DD4BF') + ';box-shadow:0 0 10px #2DD4BF;width:' + s.travelPct + '%;transition:width 2.4s linear;',
      result: s.result,
      resultStyle: 'min-height:58px;box-sizing:border-box;border-radius:14px;padding:10px 14px;display:flex;align-items:center;font-size:13px;line-height:1.45;transition:box-shadow 200ms ease, border-color 200ms ease;background:#15121C;' +
        (s.rare ? 'border:1px solid ' + actA.accent + ';color:#FFFFFF;box-shadow:0 0 22px ' + actA.accent + '77;' : 'border:1px solid #2E2838;color:#D6D0E2;'),
      heatStyle: 'height:100%;border-radius:6px;width:' + Math.min(100, s.heat) + '%;background:' + (s.heat >= 70 && s.heat <= 90 ? '#FFF1C9' : '#F5B544') + ';box-shadow:' + (s.heat >= 70 && s.heat <= 90 ? '0 0 14px #F5B544' : 'none') + ';',
      actLabel: actA.label,
      actBtnStyle: 'flex:1 1 auto;border-radius:18px;border:2px solid ' + actA.accent + ';background:' + actA.accent + ';color:#0B0910;font-family:Pixelify Sans, sans-serif;font-size:20px;font-weight:700;box-shadow:0 6px 0 ' + actA.shadow + ';',
      isPick: isStudyPick || isCraftPick,
      pickIntro: isStudyPick ? 'Studying needs a library. The nearest is chosen for you; farther ones hold rarer books.' : 'Each profession needs the right workplace. Pick one and you will head to the nearest.',
      pickOpts: pickOpts,
      goLabel: goHere ? 'Begin' : 'Walk there · ' + this.dur(chosen.mins),
      goStyle: 'min-height:56px;margin-top:4px;border-radius:14px;border:none;background:' + pickAccent + ';color:#0B0910;font-family:Pixelify Sans, sans-serif;font-size:19px;font-weight:700;box-shadow:0 5px 0 ' + pickShadow + ';',
      items: items, selName: sel[0], selRarity: sel[2].toUpperCase(), selDesc: sel[3],
      selNameStyle: 'font-family:Pixelify Sans, sans-serif;font-size:18px;color:' + rc[sel[2]] + ';',
      armors: armors, slots: slots,
      shieldLabel: s.shield ? 'Unequip Crimson Kite Shield' : 'Equip Crimson Kite Shield',
      shieldBtnStyle: 'min-height:48px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:0 3px 0 rgba(0,0,0,0.5);' + (s.shield ? 'background:transparent;color:#7DD3FC;border:2px solid #7DD3FC;' : 'background:#7DD3FC;color:#0B0910;border:2px solid #7DD3FC;'),
      isBag: s.sheet === 'bag', isGear: s.sheet === 'gear', isStats: s.sheet === 'stats', isQuests: s.sheet === 'quests',
      sheetTitle: sh[0], sheetAccent: sh[1],
      scrimStyle: 'position:absolute;left:0;top:0;width:100%;height:100%;border:none;padding:0;background:rgba(6,4,12,0.62);transition:opacity 200ms ease;' + (open ? 'opacity:1;pointer-events:auto;' : 'opacity:0;pointer-events:none;'),
      sheetStyle: 'position:absolute;left:0;bottom:0;width:100%;height:' + sheetH + 'px;box-sizing:border-box;background:#120F18;border-top:2px solid ' + sh[1] + ';border-radius:24px 24px 0 0;padding:10px 16px 20px;display:flex;flex-direction:column;gap:14px;overflow-y:auto;transition:transform 300ms cubic-bezier(.2,.9,.25,1.12), height 200ms ease;box-shadow:0 -10px 40px rgba(0,0,0,0.5);transform:translateY(' + (open ? '0' : '106%') + ');',
      fadeStyle: 'position:absolute;left:0;top:0;width:100%;height:100%;background:#0B0910;display:flex;align-items:center;justify-content:center;transition:opacity 360ms ease;' + (s.fade ? 'opacity:1;pointer-events:auto;' : 'opacity:0;pointer-events:none;'),
      fadeText: s.fadeText,
      toast: s.toast,
      toastStyle: 'position:absolute;left:50%;top:600px;transform:translateX(-50%);background:#EDE8F5;color:#0B0910;font-size:13px;font-weight:600;padding:10px 16px;border-radius:12px;white-space:nowrap;pointer-events:none;transition:opacity 200ms ease;box-shadow:0 6px 20px rgba(0,0,0,0.5);opacity:' + (s.toastOn ? '1' : '0') + ';',
      nextLoc: () => { if (s.view !== 'home') return; const n = (s.loc + 1) % 4; this.setState({ loc: n, minutes: this.locs()[n].start, placeAt: '' }); },
      openBag: () => this.setState({ sheet: 'bag' }),
      openGear: () => this.setState({ sheet: 'gear' }),
      openStats: () => this.setState({ sheet: 'stats' }),
      openQuests: () => this.setState({ sheet: 'quests' }),
      close: () => this.setState({ sheet: '' }),
      toggleShield: () => this.setState({ shield: !s.shield }),
      tapExplore: () => this.showToast('The map unfolds… (next build)'),
      tapStudy: () => this.setState({ sheet: 'study' }),
      tapCraft: () => this.setState({ sheet: 'craft' }),
      go: () => this.go(),
      doAct: () => this.doAct(),
      leave: () => this.fadeTo(s.placeAt, () => this.setState({ view: 'home', act: '', rare: false }))
    });
  }
}

// window.game is handy for poking at state from the browser console.
window.game = mount(document.getElementById('primary'), Component, document.getElementById('frame'));

function fit() {
  const s = Math.min(window.innerWidth / 390, window.innerHeight / 844);
  document.documentElement.style.setProperty('--s', s);
}
fit();
window.addEventListener('resize', fit);
