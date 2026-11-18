import { catalog, itemText } from '../src/survival/catalog.js';
import { RELICS } from '../src/v22/relics.js';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const worlds = ['DB', 'HXH', 'NARUTO', 'ONEPIECE'];
const esc = (v) => {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function kindLabel(category) {
  if (category === 'arme') return 'arme';
  if (category === 'armure') return 'armure';
  if (category === 'outil') return 'outil';
  if (category === 'consommable') return 'consommable';
  if (category === 'relique') return 'relique';
  if (category === 'hero') return 'personnage';
  return category || 'autre';
}

function formatEffects(list) {
  if (!list?.length) return '';
  return list.map((e, i) => {
    const parts = [
      `${i + 1}. ${e.name || e.type || 'effet'}`,
      e.type ? `[${e.type}]` : '',
      e.trigger ? `(${e.trigger})` : '',
      e.description || e.text || '',
    ].filter(Boolean);
    return parts.join(' ');
  }).join(' | ');
}

function effectNames(list) {
  if (!list?.length) return '';
  return list.map((e) => e.name || e.type || '').filter(Boolean).join(' · ');
}

function effectTypes(list) {
  if (!list?.length) return '';
  return list.map((e) => e.type || '').filter(Boolean).join(' · ');
}

const header = [
  'kind',
  'universe',
  'id',
  'name',
  'form_or_notes',
  'person_or_owner',
  'category',
  'rarity',
  'rank_or_tier',
  'attack_or_atk',
  'maxHp_or_shield',
  'speed_or_heal',
  'effect_key',
  'effects_count',
  'effect_names',
  'effect_types',
  'effects_detail',
  'draft',
  'allowed',
  'item_text',
];

const rows = [header];
const counts = {};
const bump = (k) => { counts[k] = (counts[k] || 0) + 1; };

for (const u of worlds) {
  const c = catalog(u);
  for (const h of c.heroes) {
    bump('personnage');
    const fx = h.effects || [];
    rows.push([
      'personnage',
      u,
      h.id,
      h.name,
      h.form || '',
      h.person || '',
      'hero',
      h.rarity || '',
      h.rank || '',
      h.attack,
      h.maxHp,
      h.speed,
      '',
      fx.length,
      effectNames(fx),
      effectTypes(fx),
      formatEffects(fx),
      '',
      '',
      '',
    ]);
  }
  for (const g of c.items) {
    const kind = kindLabel(g.category);
    bump(kind);
    const detail = itemText(g);
    rows.push([
      kind,
      u,
      g.id,
      g.name,
      g.notes || '',
      g.owner || '',
      g.category || '',
      g.rarity || '',
      g.tier ?? '',
      g.atk ?? '',
      g.shield ?? '',
      g.heal ?? '',
      g.effect || '',
      g.effect ? 1 : 0,
      g.effect || '',
      g.effect || '',
      detail,
      g.draft ? 1 : 0,
      g.allowed ? 1 : 0,
      detail,
    ]);
  }
}

for (const r of RELICS) {
  bump('relique');
  rows.push([
    'relique',
    'ALL',
    r.id,
    r.name,
    r.text || '',
    r.target || '',
    'relique',
    '',
    r.tier ?? '',
    '',
    '',
    '',
    r.type || '',
    1,
    r.name,
    r.type || '',
    r.text || '',
    '',
    '',
    r.text || '',
  ]);
}

const csv = rows.map((row) => row.map(esc).join(',')).join('\n');
const out = join(root, 'persos-catalogue.csv');
writeFileSync(out, csv, 'utf8');
writeFileSync(join('C:/Users/User/Downloads', 'persos-catalogue.csv'), csv, 'utf8');
console.log('wrote', out);
console.log('total', rows.length - 1);
console.log(counts);
const sample = rows.find((r) => r[0] === 'personnage' && Number(r[13]) >= 3);
if (sample) console.log('sample effects:', sample[14], '|', String(sample[16]).slice(0, 220));
