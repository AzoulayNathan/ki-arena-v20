/** Arena Impact V12 — règles centralisées (éditorial gameplay, non-canon œuvres). */
export const ACT_LENGTH = 10;
export const MAP_ROWS = ACT_LENGTH - 1; // 9 rows × 3 lanes + boss
export const MAP_NODES = MAP_ROWS * 3 + 1; // 28
export const BOSS_ROW = MAP_ROWS; // 9
export const DRAFT_VISIBLE = 2;
export const DRAFT_MYSTERY = 1;
export const DRAFT_OFFERS = DRAFT_VISIBLE + DRAFT_MYSTERY; // 3
/** Virtual ranks inclusive: two mid offers, one mystery. Old 15–45 band removed. */
export const DRAFT_BANDS = Object.freeze({
  midA: { lo: 25, hi: 35 },
  midB: { lo: 15, hi: 45 },
  mystery: { lo: 0, hi: 60 },
});
/** Seeded visual edition: 1/10 special template (+10% stats in combat). */
export const SPECIAL_ODDS = 10;
export const RULES_LABEL = '14.0.0';

export function virtualToLocalRank(r, NLocal) {
  return Math.max(1, Math.round(Number(r) * NLocal / 60));
}

export function waveFromDepth(act, row, actLength = ACT_LENGTH) {
  const g = act * actLength + row;
  return g + 1;
}

export function stepLabel(act, row) {
  return { act: act + 1, step: row + 1, of: ACT_LENGTH };
}

/** Deterministic special flag from seed+cardId (exactly 1/10). */
export function isSpecialEdition(seed, cardId) {
  let h = 2166136261;
  const s = String(seed) + '|' + String(cardId);
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h % SPECIAL_ODDS === 0;
}

export function worldAssetKey(universe) {
  return ({ DB: 'db', HXH: 'hxh', NARUTO: 'naruto', ONEPIECE: 'onepiece' })[universe] || String(universe).toLowerCase();
}
