// dc-lite: a tiny runtime for screens written in the prototype's template format.
//
// Templates are plain HTML inside a <template> element, with:
//   {{ path }}                       dotted lookups into renderVals() (never expressions)
//   <sc-if value="{{ cond }}">       render children when cond is truthy
//   <sc-for list="{{ xs }}" as="x">  repeat children, with {{ x.y }} and {{ $index }}
//   onClick="{{ handler }}"          event handlers returned from renderVals()
// Logic is a class extending DCLogic with state / setState / renderVals(),
// plus componentDidMount / componentWillUnmount if needed.
//
// Rendering builds a light virtual tree and patches the real DOM in place, keyed by
// template position (and loop index), so CSS animations and transitions keep running.

export class DCLogic {
  constructor(props) { this.props = props || {}; this.state = {}; }
  setState(update) {
    const u = typeof update === 'function' ? update(this.state, this.props) : update;
    this.state = Object.assign({}, this.state, u);
    if (this.__schedule) this.__schedule();
  }
  forceUpdate() { if (this.__schedule) this.__schedule(); }
}

const HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
const WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
const SVG_NS = 'http://www.w3.org/2000/svg';

function lookup(scope, path) {
  if (path === 'true') return true;
  if (path === 'false') return false;
  if (path === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
  if (/^(['"]).*\1$/.test(path)) return path.slice(1, -1);
  let v = scope;
  for (const k of path.split('.')) { if (v == null) return undefined; v = v[k]; }
  return v;
}

function value(raw, scope) {
  const m = raw.match(WHOLE);
  if (m) return lookup(scope, m[1]);
  if (raw.indexOf('{{') === -1) return raw;
  return raw.replace(HOLE, (_, p) => { const v = lookup(scope, p); return v == null ? '' : String(v); });
}

// Give each template node a stable id, so keys survive conditionals and loops.
const ids = new WeakMap();
let nextId = 1;
const idOf = n => { let id = ids.get(n); if (!id) { id = nextId++; ids.set(n, id); } return id; };

function build(node, scope, prefix, out) {
  for (let c = node.firstChild; c; c = c.nextSibling) {
    const key = prefix + idOf(c);
    if (c.nodeType === 3) {
      const t = c.nodeValue;
      if (!t.trim() && t.indexOf('\n') !== -1) continue; // formatting whitespace
      out.push({ k: key, t: value(t, scope) == null ? '' : String(value(t, scope)) });
      continue;
    }
    if (c.nodeType !== 1) continue;
    const tag = c.localName;
    if (tag === 'sc-if') {
      if (value(c.getAttribute('value') || '', scope)) build(c, scope, key + '/', out);
      continue;
    }
    if (tag === 'sc-for') {
      const list = value(c.getAttribute('list') || '', scope) || [];
      const as = c.getAttribute('as') || 'item';
      list.forEach((item, i) => {
        const s = Object.create(scope);
        s[as] = item; s.$index = i;
        build(c, s, key + '#' + i + '/', out);
      });
      continue;
    }
    const v = { k: key, tag, svg: c.namespaceURI === SVG_NS, attrs: {}, ev: {}, kids: [] };
    for (const a of c.attributes) {
      if (a.name.startsWith('hint-')) continue;
      if (a.name.startsWith('on') && a.value.indexOf('{{') !== -1) {
        const fn = value(a.value, scope);
        if (typeof fn === 'function') v.ev[a.name.slice(2).toLowerCase()] = fn;
        continue;
      }
      const val = value(a.value, scope);
      if (val == null || val === false) continue;
      v.attrs[a.name] = val === true ? '' : String(val);
    }
    build(c, scope, key + '/', v.kids);
    out.push(v);
  }
  return out;
}

function create(v) {
  if (v.t !== undefined) return (v.el = document.createTextNode(v.t));
  const el = v.svg ? document.createElementNS(SVG_NS, v.tag) : document.createElement(v.tag);
  for (const n in v.attrs) el.setAttribute(n, v.attrs[n]);
  bindEvents(el, v.ev);
  for (const k of v.kids) el.appendChild(create(k));
  return (v.el = el);
}

function bindEvents(el, ev) {
  el.__ev = ev;
  el.__bound = el.__bound || {};
  for (const name in ev) {
    if (el.__bound[name]) continue;
    el.__bound[name] = true;
    el.addEventListener(name, e => { const h = el.__ev[name]; if (h) h(e); });
  }
}

function patchKids(parent, olds, news) {
  const byKey = new Map();
  for (const o of olds) byKey.set(o.k, o);
  for (let i = 0; i < news.length; i++) {
    const n = news[i];
    const o = byKey.get(n.k);
    let el;
    if (o && (o.t !== undefined) === (n.t !== undefined) && o.tag === n.tag && o.svg === n.svg) {
      byKey.delete(n.k);
      el = n.el = o.el;
      if (n.t !== undefined) { if (o.t !== n.t) el.nodeValue = n.t; }
      else patchEl(el, o, n);
    } else {
      el = create(n);
    }
    const at = parent.childNodes[i];
    if (at !== el) parent.insertBefore(el, at || null);
  }
  for (const o of byKey.values()) if (o.el.parentNode === parent) parent.removeChild(o.el);
}

function patchEl(el, o, n) {
  for (const name in n.attrs) if (o.attrs[name] !== n.attrs[name]) el.setAttribute(name, n.attrs[name]);
  for (const name in o.attrs) if (!(name in n.attrs)) el.removeAttribute(name);
  bindEvents(el, n.ev);
  patchKids(el, o.kids, n.kids);
}

// Mount a logic class against a <template> into a root element.
export function mount(template, Logic, root, props) {
  const c = new Logic(props || {});
  let tree = [];
  let pending = false;
  const render = () => {
    pending = false;
    const next = build(template.content, c.renderVals(), '', []);
    patchKids(root, tree, next);
    tree = next;
  };
  c.__schedule = () => { if (!pending) { pending = true; queueMicrotask(render); } };
  render();
  if (c.componentDidMount) c.componentDidMount();
  return c;
}
