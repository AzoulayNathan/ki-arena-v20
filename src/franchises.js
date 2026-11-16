/** Hangar multi-jeux KI ARENA — thèmes et accès simple. */
export const FRANCHISES = Object.freeze({
  DB: {
    id: 'DB',
    name: 'Dragon Ball',
    short: 'DB',
    tagline: '600 cartes · arène finale',
    icon: '★',
    color: '#f86b26',
    accent: '#ffbd38',
    ink: '#142741',
    tone: 'orange',
  },
  HXH: {
    id: 'HXH',
    name: 'Hunter × Hunter',
    short: 'HxH',
    tagline: '532 cartes · Nen & draft',
    icon: '×',
    color: '#1f8a70',
    accent: '#7dffb2',
    ink: '#0f2f28',
    tone: 'lime',
  },
  NARUTO: {
    id: 'NARUTO',
    name: 'Naruto',
    short: 'NAR',
    tagline: '313 ninjas · chakra',
    icon: '☯',
    color: '#e4572e',
    accent: '#ffd166',
    ink: '#3b1d12',
    tone: 'gold',
  },
  ONEPIECE: {
    id: 'ONEPIECE',
    name: 'One Piece',
    short: 'OP',
    tagline: '1577 pirates · Grand Line',
    icon: '☠',
    color: '#1d4ed8',
    accent: '#fbbf24',
    ink: '#0b1c3d',
    tone: 'blue',
  },
});

export const FRANCHISE_IDS = Object.keys(FRANCHISES);
export function franchiseOf(id) {
  return FRANCHISES[id] || FRANCHISES.DB;
}
export function franchiseCssVars(id) {
  const f = franchiseOf(id);
  return `--fr-color:${f.color};--fr-accent:${f.accent};--fr-ink:${f.ink}`;
}
