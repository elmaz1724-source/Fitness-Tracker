#!/usr/bin/env node
/* Regression test for FORGE 8 default simple mode: no fitness records are touched. */
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const source=readFileSync(resolve(fileURLToPath(new URL('../forge-basics.js',import.meta.url))),'utf8');
let assertions=0;
const verify=(condition,message)=>{if(!condition)throw Error('FORGE basics: '+message);assertions++;};
function setup({hash='',mode='custom'}={}){
 const rootClass=new Set(['forge-basics']);
 const classList={contains:c=>rootClass.has(c),toggle(c,yes){
  if(yes)rootClass.add(c);else rootClass.delete(c);
 }};
 const listeners={};
 const el=id=>({id,value:'',textContent:'',innerHTML:'',open:false,attrs:{},listeners:{},
   classList:{tokens:new Set(),toggle(k,on){if(on)this.tokens.add(k);else this.tokens.delete(k)},contains(k){return this.tokens.has(k)}},
   addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)},
   dispatchEvent(e){for(const fn of this.listeners[e.type]??[])fn(e)},
   click(){this.dispatchEvent({type:'click'})},
   setAttribute(k,v){this.attrs[k]=v},
   getAttribute(k){return this.attrs[k]??null}
 });
 const ids=['forgeBasicsToggle','forgeBasicsBackup','forgeHeaderMenu','pace','incline',
  'forgeBasicsPace','forgeBasicsIncline','forgeBasicsPaceFeedback','paceError',
  'inclineGrade','forgeBasicsGrade','inclineUnit','forgeBasicsInclineUnit',
  'forgeBasicsDegrees','forgeBasicsPercent','forgeBasicsInclineLabel',
  'forgeWalkAdvanced','walkSteps','otherSteps','exportData','forgeBasicsNote'];
 const items=Object.fromEntries(ids.map(id=>[id,el(id)]));
 items.pace.value='6,7';items.incline.value='8';
 items.inclineUnit.value='degrees';items.inclineGrade.value='14';
 const tabs={training:el('training'),today:el('today')};
 tabs.training.classList={contains:c=>c==='active'&&!!tabs.training.active};
 tabs.today.classList={contains:c=>c==='active'&&!tabs.training.active};
 tabs.today.click=()=>{tabs.training.active=false;tabs.today.clicked=true};
 const document={body:{classList},activeElement:null,
  getElementById:id=>items[id]??null,
  querySelector:s=>{
   const view=s.match(/^\s*\.tab\[data-view="([^"]+)"\]/)?.[1];
   return tabs[view]??null;
  }
 };
 const pref={pace:6.7,steps:7300,other:550,stride:.76,incline:8,mode};
 const db=new Map([['fitness-walking',JSON.stringify(pref)],['fitness-weights','[{"date":"2026-11-01","value":92.1}]']]);
 const localStorage={getItem:k=>db.get(k)??null,setItem:(k,v)=>db.set(k,v)};
 const window={events:{},addEventListener(k,fn){(this.events[k]??=[]).push(fn)}};
 const location={hash};
 class Event{constructor(type){this.type=type}}
 let recalculations=0,exports=0;
 items.pace.addEventListener('input',()=>{recalculations++;items.paceError.textContent=''});
 items.exportData.click=()=>exports++;
 runInNewContext(source,{document,localStorage,location,window,Event});
 return {items,rootClass,tabs,db,window,get recalculations(){return recalculations},get exports(){return exports}};
}
const app=setup(),i=app.items;
verify(app.rootClass.has('forge-basics'),'starts in the simple mode');
verify(i.forgeBasicsPace.value==='6,7'&&i.forgeBasicsIncline.value==='8','simple controls mirror real calculator');
verify(i.forgeBasicsToggle.getAttribute('aria-pressed')==='false','advanced view initially off');
i.forgeBasicsPace.value='6,2';i.forgeBasicsPace.dispatchEvent({type:'input'});
verify(i.pace.value==='6,2'&&app.recalculations>=1,'speed forwards to the one original calculator');
i.forgeBasicsIncline.value='5';i.forgeBasicsIncline.dispatchEvent({type:'input'});
verify(i.incline.value==='5','incline forwards to original calculator');
i.forgeBasicsPercent.click();
verify(i.inclineUnit.value==='percent'&&i.forgeBasicsPercent.getAttribute('aria-pressed')==='true',
 'simple percentage button activates the shared calculator mode');
verify(i.forgeBasicsIncline.hidden===true&&i.forgeBasicsGrade.hidden===false,
 'the treadmill grade picker replaces the angle input');
i.forgeBasicsGrade.value='4.5';i.forgeBasicsGrade.dispatchEvent({type:'change'});
verify(i.inclineGrade.value==='4.5','0.5-percent grade preset forwards to calculator');
i.forgeBasicsDegrees.click();
verify(i.inclineUnit.value==='degrees'&&i.forgeBasicsDegrees.getAttribute('aria-pressed')==='true',
 'switching back preserves degrees mode');
verify(JSON.parse(app.db.get('fitness-walking')).steps===7300,'existing walking plan untouched by UI forwarding');
i.forgeBasicsToggle.click();
verify(!app.rootClass.has('forge-basics'),'advanced view opens');
verify(i.walkSteps.value==='7300'&&i.otherSteps.value==='550'&&i.forgeWalkAdvanced.open,
 'existing custom walking plan is restored');
verify(i.forgeBasicsToggle.getAttribute('aria-pressed')==='true','advanced mode announced');
i.forgeBasicsToggle.click();
verify(app.rootClass.has('forge-basics'),'user can return to simple mode');
i.forgeBasicsBackup.click();
verify(app.exports===1,'backup shortcut reuses existing JSON exporter');
verify(JSON.parse(app.db.get('fitness-walking')).steps===7300&&app.db.has('fitness-weights'),'original data remains untouched');
const bridge=setup({hash:'#forge-sync?date=2026-11-07&steps=9000'});
verify(!bridge.rootClass.has('forge-basics'),'Health import exposes archived Training view');
const pop=setup();
pop.window.events.popstate[0]({state:{forgeView:'training'}});
verify(!pop.rootClass.has('forge-basics'),'browser back to Training reveals archived view');
console.log('FORGE basics: '+assertions+' tests passed');
