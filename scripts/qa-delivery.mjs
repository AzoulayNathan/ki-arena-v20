/* Delivery maintenance checks. Corrupt/import/quota states are synthetic. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {readFileSync,writeFileSync,mkdtempSync,copyFileSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createSurvival,command} from '../src/survival/state-machine.js';
import {catalog} from '../src/survival/catalog.js';
const root=fileURLToPath(new URL('../',import.meta.url)),offline=process.argv.includes('--offline'),require=createRequire(import.meta.url),{chromium}=require((process.env.PLAYWRIGHT_NODE_MODULES||process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)+'/playwright');
mkdirSync(root+'qa/delivery',{recursive:true});
const report={offline,formats:[],errors:[],requests:[],notice:'Recette de sauvegardes interrompues, import incompatible et quota plein sur états synthétiques. Aucune partie utilisateur.'};
const folder=offline?mkdtempSync(join(tmpdir(),'ki-delivery-only-')):null,file=offline?join(folder,'JOUER_KI_ARENA_V9.html'):null;
if(offline)copyFileSync(root+'JOUER_KI_ARENA_V9.html',file);
const entry=offline?pathToFileURL(file).href:'http://127.0.0.1:4173',server=offline?null:spawn(process.execPath,['scripts/local-server-v9.mjs'],{cwd:root,env:{...process.env,KI_NO_OPEN:'1'}});
if(server)await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.stderr.once('data',s=>reject(Error(String(s))))});
let browser;
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||root+'../qa-runtime/browser/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [width,height] of [[390,700],[768,844],[1360,844]]){
  const context=await browser.newContext({offline,reducedMotion:'reduce',viewport:{width,height},acceptDownloads:true}),p=await context.newPage();
  p.on('pageerror',e=>report.errors.push(e.stack));p.on('request',r=>{if(offline&&r.url()!==entry&&!/^(data:|blob:)/.test(r.url()))report.requests.push(r.url());});
  await p.goto(entry);const raw='{ sauvegarde interrompue',hxh=JSON.stringify(createSurvival('HXH','HXH-preserve'));
  const auto={version:1,seed:'AUTO-PRESERVE',side:'a',opponent:'cpu',a:[null,null,null,null,null],b:[null,null,null,null,null]};
  const legacy=await p.evaluate(({raw,hxh,auto})=>{localStorage.setItem('kiarena:v9:survival:DB',raw);localStorage.setItem('kiarena:v9:survival:HXH',hxh);localStorage.setItem('kiarena:auto5:v1',JSON.stringify(auto));return localStorage.getItem('kiarena_arcade_v3');},{raw,hxh,auto});
  await p.locator('[data-page=survival]').click();await p.locator('.sv-save-recovery').waitFor();
  const dl=p.waitForEvent('download');await p.locator('[data-sv=exportRaw]').click();const download=await dl,path=root+`qa/delivery/raw-export-${offline?'offline-':''}${width}.json`;await download.saveAs(path);assert.equal(readFileSync(path,'utf8'),raw);
  await p.locator('#sv-seed').fill('RECOVERY-'+width);await p.locator('[data-sv=new]').click();assert.equal(await p.locator('.sv-confirm').count(),1);assert.equal(await p.evaluate(()=>localStorage.getItem('kiarena:v9:survival:DB')),raw);
  await p.locator('[data-sv=cancel]').click();assert.equal(await p.evaluate(()=>localStorage.getItem('kiarena:v9:survival:DB')),raw);
  await p.locator('#sv-seed').fill('RECOVERY-'+width);await p.locator('[data-sv=new]').click();
  await p.screenshot({path:root+`captures/delivery-${offline?'offline-':''}recovery-${width}.png`,fullPage:true});
  await p.locator('[data-sv=confirmNew]').click();assert.equal(await p.locator('.sv-draft').count(),1);const good=await p.evaluate(()=>localStorage.getItem('kiarena:v9:survival:DB'));assert.equal(JSON.parse(good).seed,'RECOVERY-'+width);
  const mixed=createSurvival('DB','bad-import');for(let i=0;i<8;i++)command(mixed,'draft',{index:0});command(mixed,'route',{id:'normal'});command(mixed,'fight');command(mixed,'deployAll');mixed.combat.enemies[0].cardId=catalog('HXH').heroes[0].id;
  await p.locator('#sv-import').setInputFiles({name:'incompatible.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'KI_ARENA_SURVIVAL',version:1,run:mixed}))});await p.locator('.sv-error').waitFor();assert.equal(await p.evaluate(()=>localStorage.getItem('kiarena:v9:survival:DB')),good);
  const fixture=createSurvival('DB','quota');for(let i=0;i<8;i++)command(fixture,'draft',{index:0});command(fixture,'route',{id:'normal'});command(fixture,'fight');command(fixture,'deployAll');
  await p.evaluate(r=>localStorage.setItem('kiarena:v9:survival:DB',JSON.stringify(r)),fixture);await p.reload();await p.locator('[data-page=survival]').click();await p.locator('[data-sv=resume]').click();
  const before=await p.evaluate(()=>localStorage.getItem('kiarena:v9:survival:DB'));
  await p.evaluate(()=>{window.qaSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='kiarena:v9:survival:DB')throw new DOMException('Quota plein','QuotaExceededError');return window.qaSetItem.call(this,k,v);};});
  await p.locator('[data-sv=round]').click();await p.locator('.sv-error').waitFor();assert.match(await p.locator('.sv-error').innerText(),/Enregistrement impossible/);assert.equal(await p.evaluate(()=>localStorage.getItem('kiarena:v9:survival:DB')),before);assert.match(await p.locator('.sv-battle-top h2').innerText(),/1/);assert.equal(await p.locator('.sv-rewards').count(),0);
  await p.evaluate(()=>Storage.prototype.setItem=window.qaSetItem);
  assert.equal(await p.evaluate(()=>localStorage.getItem('kiarena:v9:survival:HXH')),hxh);assert.equal(await p.evaluate(()=>localStorage.getItem('kiarena:auto5:v1')),JSON.stringify(auto));assert.equal(await p.evaluate(()=>localStorage.getItem('kiarena_arcade_v3')),legacy);
  await p.reload();await p.locator('[data-page=survival]').click();await p.locator('[data-sv=resume]').click();assert.match(await p.locator('.sv-battle-top h2').innerText(),/1/);
  report.formats.push({width,height,rawBackupExact:true,confirmationRequired:true,cancelPreservesBytes:true,recoveryWorks:true,crossUniverseImportRejected:true,quotaFailureAtomic:true,V8HXHAutoPreserved:true,reloadIntact:true});await context.close();
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.requests,[]);report.pass=true;
}catch(e){report.pass=false;report.failure=e.stack;throw e;}finally{writeFileSync(root+'qa/delivery/'+(offline?'offline-report':'browser-report')+'.json',JSON.stringify(report,null,2));await browser?.close();server?.kill();}
console.log(JSON.stringify(report,null,2));
