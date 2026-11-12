import {beginEvent as oldBegin,eventOption as oldOption} from '../v19/events.js';
import {beginEvent as newBegin,eventOption as newOption} from './events.js';
export const beginEvent=r=>r.rulesVersion==='20.0.0'?newBegin(r):oldBegin(r);
export const eventOption=(r,id)=>r.rulesVersion==='20.0.0'?newOption(r,id):oldOption(r,id);
