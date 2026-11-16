import {beginEvent22,eventOption22} from '../v22/events.js';
import {beginEvent as oldBegin,eventOption as oldOption} from '../v19/events.js';
import {beginEvent as newBegin,eventOption as newOption} from './events.js';
export const beginEvent=r=>r.contentVersion==='22.0.0'?beginEvent22(r):r.rulesVersion==='20.0.0'?newBegin(r):oldBegin(r);
export const eventOption=(r,id)=>r.contentVersion==='22.0.0'?eventOption22(r,id):r.rulesVersion==='20.0.0'?newOption(r,id):oldOption(r,id);
