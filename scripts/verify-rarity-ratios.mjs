import {registry, WORLDS} from '../src/v20/catalog.js';
import {RARITY_RATES} from '../src/survival/catalog.js';
import {createRun22} from '../src/v22/new-run.js';
import {ensureDraft, chooseDraft} from '../src/v20/engine.js';

console.log('rates', RARITY_RATES);

function dist(worlds) {
  const c = registry(worlds, 'raw');
  const rar = {common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0};
  for (const h of c.heroes) rar[h.rarity]++;
  const N = c.heroes.length;
  const pct = Object.fromEntries(Object.entries(rar).map(([k, v]) => [k, +(100 * v / N).toFixed(1)]));
  return {N, rar, pct};
}

const target = {common: 33, uncommon: 27, rare: 21, epic: 15, legendary: 4};
let bad = 0;
for (const w of WORLDS) {
  const d = dist([w]);
  console.log(w, JSON.stringify(d.pct), 'N', d.N);
  for (const [k, t] of Object.entries(target)) {
    if (Math.abs(d.pct[k] - t) > 1.5) {
      console.error('  OFF', k, d.pct[k], 'want', t);
      bad++;
    }
  }
  // start draft should now include some non-commons for OP
  const seen = {};
  for (let i = 0; i < 15; i++) {
    const r = createRun22([w]);
    while (r.phase === 'draft') {
      ensureDraft(r);
      for (const o of r.offers) {
        if (o.disabled || o.kind !== 'hero') continue;
        const h = registry([w], 'raw').byId.get(o.id);
        seen[h.rarity] = (seen[h.rarity] | 0) + 1;
      }
      chooseDraft(r, r.offers.find(o => !o.disabled).token);
    }
  }
  console.log('  startDraft heroes', seen);
}
console.log('ALL', JSON.stringify(dist(WORLDS).pct));
if (bad) {
  console.error('FAILED', bad);
  process.exit(1);
}
console.log('RARITY RATIOS OK');
