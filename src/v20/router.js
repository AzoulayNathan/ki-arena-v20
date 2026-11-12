import {generateMap as old_generateMap,availableNodes as old_availableNodes,createRun as old_createRun,isCurrentRules as old_isCurrentRules,runCatalog as old_runCatalog,depthWave as old_depthWave,createRunV16 as old_createRunV16,createRunV17 as old_createRunV17,markRareNodes as old_markRareNodes,createRunV19 as old_createRunV19,ensureDraft as old_ensureDraft,chooseDraft as old_chooseDraft,makeEncounter as old_makeEncounter,enterNode as old_enterNode,leaveNode as old_leaveNode,equip as old_equip,gearFor as old_gearFor,battleCard as old_battleCard,startCombat as old_startCombat,completeCombat as old_completeCombat,rewardOptions as old_rewardOptions,chooseReward as old_chooseReward,heal as old_heal,rest as old_rest,resolveEvent as old_resolveEvent,buy as old_buy,buyCare as old_buyCare,swapActive as old_swapActive,finalizeRun as old_finalizeRun,buildRunReceipt as old_buildRunReceipt,NODE_INFO as old_NODE_INFO} from '../v19/engine.js';
import {generateMap as new_generateMap,availableNodes as new_availableNodes,createRun as new_createRun,isCurrentRules as new_isCurrentRules,runCatalog as new_runCatalog,depthWave as new_depthWave,createRunV16 as new_createRunV16,createRunV17 as new_createRunV17,markRareNodes as new_markRareNodes,createRunV19 as new_createRunV19,ensureDraft as new_ensureDraft,chooseDraft as new_chooseDraft,makeEncounter as new_makeEncounter,enterNode as new_enterNode,leaveNode as new_leaveNode,equip as new_equip,gearFor as new_gearFor,battleCard as new_battleCard,startCombat as new_startCombat,completeCombat as new_completeCombat,rewardOptions as new_rewardOptions,chooseReward as new_chooseReward,heal as new_heal,rest as new_rest,resolveEvent as new_resolveEvent,buy as new_buy,buyCare as new_buyCare,swapActive as new_swapActive,finalizeRun as new_finalizeRun,buildRunReceipt as new_buildRunReceipt,NODE_INFO as new_NODE_INFO} from './engine.js';
export const NODE_INFO=old_NODE_INFO;
export function generateMap(...args){return old_generateMap(...args);}
export function availableNodes(...args){return (args[0]?.rulesVersion==='20.0.0'?new_availableNodes:old_availableNodes)(...args);}
export function createRun(...args){return old_createRun(...args);}
export function isCurrentRules(...args){return (args[0]?.rulesVersion==='20.0.0'?new_isCurrentRules:old_isCurrentRules)(...args);}
export function runCatalog(...args){return (args[0]?.rulesVersion==='20.0.0'?new_runCatalog:old_runCatalog)(...args);}
export function depthWave(...args){return (args[0]?.rulesVersion==='20.0.0'?new_depthWave:old_depthWave)(...args);}
export function createRunV16(...args){return old_createRunV16(...args);}
export function createRunV17(...args){return old_createRunV17(...args);}
export function markRareNodes(...args){return (args[0]?.rulesVersion==='20.0.0'?new_markRareNodes:old_markRareNodes)(...args);}
export function createRunV19(...args){return new_createRunV19(...args);}
export function ensureDraft(...args){return (args[0]?.rulesVersion==='20.0.0'?new_ensureDraft:old_ensureDraft)(...args);}
export function chooseDraft(...args){return (args[0]?.rulesVersion==='20.0.0'?new_chooseDraft:old_chooseDraft)(...args);}
export function makeEncounter(...args){return (args[0]?.rulesVersion==='20.0.0'?new_makeEncounter:old_makeEncounter)(...args);}
export function enterNode(...args){return (args[0]?.rulesVersion==='20.0.0'?new_enterNode:old_enterNode)(...args);}
export function leaveNode(...args){return (args[0]?.rulesVersion==='20.0.0'?new_leaveNode:old_leaveNode)(...args);}
export function equip(...args){return (args[0]?.rulesVersion==='20.0.0'?new_equip:old_equip)(...args);}
export function gearFor(...args){return (args[0]?.rulesVersion==='20.0.0'?new_gearFor:old_gearFor)(...args);}
export function battleCard(...args){return (args[0]?.rulesVersion==='20.0.0'?new_battleCard:old_battleCard)(...args);}
export function startCombat(...args){return (args[0]?.rulesVersion==='20.0.0'?new_startCombat:old_startCombat)(...args);}
export function completeCombat(...args){return (args[0]?.rulesVersion==='20.0.0'?new_completeCombat:old_completeCombat)(...args);}
export function rewardOptions(...args){return (args[0]?.rulesVersion==='20.0.0'?new_rewardOptions:old_rewardOptions)(...args);}
export function chooseReward(...args){return (args[0]?.rulesVersion==='20.0.0'?new_chooseReward:old_chooseReward)(...args);}
export function heal(...args){return (args[0]?.rulesVersion==='20.0.0'?new_heal:old_heal)(...args);}
export function rest(...args){return (args[0]?.rulesVersion==='20.0.0'?new_rest:old_rest)(...args);}
export function resolveEvent(...args){return (args[0]?.rulesVersion==='20.0.0'?new_resolveEvent:old_resolveEvent)(...args);}
export function buy(...args){return (args[0]?.rulesVersion==='20.0.0'?new_buy:old_buy)(...args);}
export function buyCare(...args){return (args[0]?.rulesVersion==='20.0.0'?new_buyCare:old_buyCare)(...args);}
export function swapActive(...args){return (args[0]?.rulesVersion==='20.0.0'?new_swapActive:old_swapActive)(...args);}
export function finalizeRun(...args){return (args[0]?.rulesVersion==='20.0.0'?new_finalizeRun:old_finalizeRun)(...args);}
export function buildRunReceipt(...args){return (args[0]?.rulesVersion==='20.0.0'?new_buildRunReceipt:old_buildRunReceipt)(...args);}
