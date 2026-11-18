/** Choix de voie au lancement : précédente (/classic) vs nouvelle (V12 + JoJo). */
export const LANE_KEY='kiarena:release-lane';
/** Same-origin classic snapshot — never the production root (that is already V23). */
export const CLASSIC_URL='./classic/';
/** Immutable pre-V12 CF deploy — used only if /classic/ is unreachable. */
export const CLASSIC_FALLBACK_URL='https://f3d4d42d.ki-arena-v20.pages.dev/';
export const NEW_LABEL='Nouvelle · V12 + JoJo';
export const CLASSIC_LABEL='Précédente · build classique';

export function currentLane(){
 try{return localStorage.getItem(LANE_KEY)||'';}catch{return '';}
}
export function setLane(lane){
 try{localStorage.setItem(LANE_KEY,lane);}catch{}
}
export function clearLane(){
 try{localStorage.removeItem(LANE_KEY);}catch{}
}

export function classicHref(){
 try{
  return new URL(CLASSIC_URL,location.href).href;
 }catch{
  return CLASSIC_FALLBACK_URL;
 }
}

export function versionGateMarkup(){
 return `<section class="v23-version-gate" aria-label="Choix de version">
  <div class="v23-version-card">
   <p class="v23-version-kicker">KI ARENA · MISE À JOUR</p>
   <h1>Quelle version jouer&nbsp;?</h1>
   <p>La précédente reste disponible sous <code>/classic/</code>. La nouvelle apporte le catalogue V12, JoJo, draft 5+2, butin boss 1-sur-3, level-up illimité et évolutions.</p>
   <div class="v23-version-actions">
    <button type="button" class="a-button light" data-a="version-classic">${CLASSIC_LABEL}</button>
    <button type="button" class="a-button primary" data-a="version-new">${NEW_LABEL}</button>
   </div>
   <p class="v23-version-note">Tu pourras changer plus tard depuis les réglages.</p>
  </div>
 </section>`;
}

export function versionGateStyles(){
 return `.v23-version-gate{min-height:100dvh;display:grid;place-items:center;padding:24px;background:
  radial-gradient(ellipse at 20% 10%,rgba(167,139,250,.25),transparent 50%),
  radial-gradient(ellipse at 80% 90%,rgba(247,146,62,.2),transparent 45%),
  linear-gradient(160deg,#1a1428,#0f1c24 55%,#142018);}
.v23-version-card{max-width:34rem;width:100%;padding:2rem 1.6rem;border:1px solid rgba(255,255,255,.14);background:rgba(12,16,22,.82);color:#f4f0ea;box-shadow:0 24px 60px rgba(0,0,0,.35);backdrop-filter:blur(10px);}
.v23-version-kicker{letter-spacing:.18em;font-size:.72rem;opacity:.7;margin:0 0 .6rem;}
.v23-version-card h1{font-family:Georgia,"Times New Roman",serif;font-size:clamp(1.6rem,4vw,2.2rem);margin:0 0 .75rem;line-height:1.15;}
.v23-version-card p{margin:0 0 1.1rem;line-height:1.45;opacity:.9;}
.v23-version-card code{font-size:.9em;opacity:.85;}
.v23-version-actions{display:grid;gap:.7rem;}
.v23-version-actions .a-button{width:100%;justify-content:center;}
.v23-version-note{margin:1rem 0 0;font-size:.85rem;opacity:.65;}`;
}

export function ensureVersionGateStyle(){
 if(document.getElementById('v23-version-gate-style'))return;
 const s=document.createElement('style');
 s.id='v23-version-gate-style';
 s.textContent=versionGateStyles();
 document.head.append(s);
}
