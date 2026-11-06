#!/usr/bin/env node
/* Reports the declarations of an activity's styles.css that override a shared
   component rule with a different value: the same selector and the same property,
   other value. Those overrides drift: the same component looks different depending
   on the activity.

     node scripts/css-drift.js

   What is NOT drift:
   - a rule that adds properties the shared rule does not set (an extension);
   - a module tint: `color: var(--mod-…)` on an activity's own accent. It is the
     activity's identity, so it is counted and listed apart, not reported.

   Shared rules are read from assets/css/components.css and
   assets/css/activity-flow.css. When a selector is in both files, the flow file
   wins on the flow pages, so its values are the ones that count.

   Report only: changing a value changes the look, so the script never edits. The
   dedupe of identical declarations is described in the technical doc. */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SHARED = ['assets/css/components.css', 'assets/css/activity-flow.css'];

/* Top-level rules: { sel, decls: Map(prop -> value) }, comments removed. */
function topRules(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [];
  let depth = 0, selStart = 0, open = -1;
  for (let i = 0; i < clean.length; i += 1) {
    const c = clean[i];
    if (c === '{') {
      if (depth === 0) open = i;
      depth += 1;
    } else if (c === '}') {
      depth -= 1;
      if (depth === 0) {
        const sel = clean.slice(selStart, open).trim().replace(/\s+/g, ' ');
        if (!sel.startsWith('@')) {
          const decls = new Map();
          clean.slice(open + 1, i).split(';').forEach(d => {
            const k = d.indexOf(':');
            if (k > 0) decls.set(d.slice(0, k).trim(), d.slice(k + 1).replace(/\s+/g, ' ').trim());
          });
          rules.push({ sel, decls });
        }
        selStart = i + 1;
      }
    }
  }
  return rules;
}

const shared = new Map(); // selector -> Map(prop -> value); the later file wins per property
for (const file of SHARED) {
  for (const rule of topRules(fs.readFileSync(path.join(ROOT, file), 'utf8'))) {
    const into = shared.get(rule.sel) || new Map();
    rule.decls.forEach((v, p) => into.set(p, v));
    shared.set(rule.sel, into);
  }
}

const drift = [];
const tints = [];
for (const slug of fs.readdirSync(path.join(ROOT, 'tools'))) {
  const file = path.join(ROOT, 'tools', slug, 'styles.css');
  if (!fs.existsSync(file)) continue;
  for (const rule of topRules(fs.readFileSync(file, 'utf8'))) {
    const base = shared.get(rule.sel);
    if (!base) continue;
    rule.decls.forEach((value, prop) => {
      if (!base.has(prop) || base.get(prop) === value) return;
      const entry = { slug, sel: rule.sel, prop, local: value, shared: base.get(prop) };
      if (prop === 'color' && /var\(--mod-/.test(value)) tints.push(entry);
      else drift.push(entry);
    });
  }
}

drift.forEach(d => {
  console.log(d.slug.padEnd(18) + ' ' + d.sel + ' { ' + d.prop + ': ' + d.local + ' }');
  console.log('    shared: ' + d.prop + ': ' + d.shared);
});
console.log(drift.length
  ? 'Copias con deriva: ' + drift.length + ' (solo informe; no se cambia el aspecto automáticamente)'
  : 'Sin deriva: ningún override cambia el valor de una propiedad compartida.');
console.log('Tintes de módulo (identidad de la actividad, no cuentan como deriva): ' + tints.length);
