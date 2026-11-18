import {createRun22} from '../src/v22/new-run.js';
import {createRunV19, ensureDraft, chooseDraft} from '../src/v20/engine.js';
import {registry, WORLDS} from '../src/v20/catalog.js';
import {powerBounds, sortedPool} from '../src/v22/power.js';
import {initialBounds, weaponPool, initialPool} from '../src/v20/draft.js';

const report = [];
let failed = 0;

for (const w of WORLDS) {
  const worlds = [w];
  const c = registry(worlds, 'raw');
  const heroes = initialPool(worlds, 'raw');
  const weapons = weaponPool(worlds, 'raw');
  const row = {world: w, N: c.N, weapons: weapons.length, ok: true, issues: []};

  // Among the starter-legal gear (tier<=2), lowest ranks must be filled by them first.
  const starter = weapons.filter(g => (g.tier || 1) <= 2);
  const weak = weapons.slice(0, Math.min(starter.length, weapons.length));
  if (weak.some(g => (g.tier || 1) > 2)) {
    row.ok = false;
    row.issues.push('weak ranks include tier>2 before starter gear: ' + weak.map(g => g.name + ':t' + g.tier).join(', '));
  }
  row.starterCount = starter.length;

  const heroR = {}, weapT = {};
  let maxTier22 = 0, maxTier19 = 0, legHero = 0;
  for (let i = 0; i < 20; i++) {
    const r = createRun22(worlds);
    while (r.phase === 'draft') {
      ensureDraft(r);
      for (const o of r.offers) {
        if (o.disabled) continue;
        const b = powerBounds(r, o.kind, o.band, true);
        if (o.globalRank < b.lo || o.globalRank > b.hi) {
          row.ok = false;
          row.issues.push(`v22 out of bounds ${o.kind} ${o.globalRank} not in ${b.lo}-${b.hi}`);
        }
        if (o.kind === 'hero') {
          const h = c.byId.get(o.id);
          heroR[h.rarity] = (heroR[h.rarity] | 0) + 1;
          if (h.rarity === 'legendary') { legHero++; row.ok = false; row.issues.push('legendary hero ' + h.name); }
        } else {
          const g = c.byItem.get(o.id);
          weapT['t' + g.tier] = (weapT['t' + g.tier] | 0) + 1;
          maxTier22 = Math.max(maxTier22, g.tier || 0);
          if ((g.tier || 0) > 2) { row.ok = false; row.issues.push('v22 weapon t' + g.tier + ' ' + g.name); }
        }
      }
      chooseDraft(r, r.offers.find(o => !o.disabled).token);
    }
  }

  for (let i = 0; i < 15; i++) {
    const r = createRunV19(worlds, 'audit-' + w + '-' + i, 'raw');
    while (r.phase === 'draft') {
      ensureDraft(r);
      if (r.offers.every(o => o.disabled)) {
        row.ok = false;
        row.issues.push('v19 all offers disabled at step ' + r.step);
        break;
      }
      for (const o of r.offers) {
        if (o.disabled || o.kind !== 'weapon') continue;
        const g = c.byItem.get(o.id);
        maxTier19 = Math.max(maxTier19, g.tier || 0);
        if ((g.tier || 0) > 2) { row.ok = false; row.issues.push('v19 weapon t' + g.tier + ' ' + g.name); }
      }
      chooseDraft(r, r.offers.find(o => !o.disabled).token);
    }
  }

  const firstNC = heroes.findIndex(h => h.rarity !== 'common') + 1;
  const hb = initialBounds('mystery', c.N);
  row.heroes = heroR;
  row.maxTier = {v22: maxTier22, v19: maxTier19};
  row.weaponsDrawn = weapT;
  row.firstNonCommon = firstNC;
  row.mysteryHiPct = +(hb.hi / c.N * 100).toFixed(1);
  row.weakWeapons = weak.map(g => g.name + ':t' + g.tier);
  if (!row.ok) failed++;
  report.push(row);
  console.log((row.ok ? 'OK ' : 'FAIL ') + w, 'N=' + c.N, 'W=' + weapons.length, 'heroes', heroR, 'weap', weapT, 'maxT', row.maxTier, 'issues', row.issues.slice(0, 3));
}

console.log('\n' + JSON.stringify(report, null, 2));
if (failed) {
  console.error('FAILED', failed);
  process.exit(1);
}
console.log('ALL MANGAS DRAFT OK');
