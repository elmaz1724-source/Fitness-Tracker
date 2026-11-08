#!/usr/bin/env node
// FORGE 8.3 regression: original goals, single-source Walking blocks, weekly actual history.
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const html=read('index.html');
const css=read('forge-polish.css');
const inline=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
let passed=0;
function check(v,msg){if(!v)throw Error('FORGE restored basics: '+msg);passed++}
check(!!inline,'inline application exists');
new Script(inline);
check(html.includes('<body class="forge-basics">'),'simple view is the default');
check(html.includes('id="forgeBasicsDaily"')&&html.includes('id="forgeSimpleBlocks"')&&html.includes('id="forgeSimpleWeek"'),'all three restored basics are mounted');
check(css.includes('#today>:not(#forgeStepsCenter):not(#forgeBasicsDaily)'),'daily goals are not hidden with old cards');
check(css.includes('#walking .forge-simple-blocks{order:3;')&&css.includes('#walking #forgeSimpleWeek{order:5}'),'3-block plan and week chart visible in correct order');
const goals=html.slice(html.indexOf('<section class="forge-basics-daily"'),html.indexOf('</section>',html.indexOf('<section class="forge-basics-daily"')));
const keys=[...goals.matchAll(/class="check daily" data-key="([^"]+)"/g)].map(x=>x[1]);
check(keys.join(',')==='cal,protein,steps,training,recovery','all five original daily goals and keys preserved');
check((html.match(/id="scoreText"/g)||[]).length===1&&(html.match(/id="dailyProgress"/g)||[]).length===1,'only one checklist score and bar');
const tags=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
check(tags.length===new Set(tags).size,'no duplicate DOM IDs');
check((html.match(/id="forgeStepWeekBars"/g)||[]).length===1,'one real seven-day chart');
check(html.indexOf('id="forgeSimpleWeek"')<html.indexOf('id="forgeWalkAdvanced"'),'weekly chart is outside the hidden advanced details');
check(html.indexOf('id="forgeSimpleBlocks"')<html.indexOf('id="forgeWalkAdvanced"'),'three-block plan is outside the hidden advanced details');
check((html.match(/id="weekGrid"/g)||[]).length===1,'manual weekly tracker remains archived');
check(css.includes('body:not(.forge-basics)')&&css.includes('background:#1b1d22;border-color:#34363d;box-shadow:none'),'advanced UI uses the same neutral graphite surfaces');
check(css.includes('body:not(.forge-basics) .tab.active')&&css.includes('background:#303238'),'advanced tab selection is subdued');
check(css.includes('body:not(.forge-basics) :is(.check,input[type="checkbox"]){accent-color:#82b4ff}'),'advanced checkbox accent is blue, not green');
check(css.includes('background:#82b4ff')&&css.includes('body:not(.forge-basics) :is('),'advanced uses blue only for priority actions and progress');

function fake(id=''){
  return {id,value:'',textContent:'',checked:false,attrs:{},className:'',style:{
    width:'',height:'',setProperty(k,v){this[k]=v}
  },children:[],listeners:{},classList:{toggle(){},add(){}},
    addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)},
    setAttribute(k,v){this.attrs[k]=v},
    appendChild(c){this.children.push(c)},append(...a){this.children.push(...a)},
    replaceChildren(){this.children=[]}};
}
const byId=Object.fromEntries(tags.map(id=>['#'+id,fake(id)]));
const $=selector=>{if(!byId[selector])throw Error('Missing DOM control: '+selector);return byId[selector]};
const daily=keys.map(key=>Object.assign(fake(),{dataset:{key}}));
const store=new Map();
const storage={
  get(key,fallback){return store.has(key)?store.get(key):fallback},
  set(key,value){store.set(key,value)}
};
const dailyStart=inline.indexOf('  // Daily goals'),dailyEnd=inline.indexOf('  // Walking –',dailyStart);
check(dailyStart>=0&&dailyEnd>dailyStart,'existing daily-goal implementation found');
const setupDaily=new Function('$','$$','storage',inline.slice(dailyStart,dailyEnd)+'\nreturn dailyKey;');
const dailyKey=setupDaily($,()=>daily,storage);
check(dailyKey.startsWith('fitness-daily-')&&byId['#scoreText'].textContent==='· 0/5','daily goals load from the original dated key');
daily[0].checked=true;daily[0].listeners.change[0]();
daily[3].checked=true;daily[3].listeners.change[0]();
check(byId['#scoreText'].textContent==='· 2/5'&&byId['#dailyProgress'].style.width==='40%','checkbox changes update the original count and bar');
check(store.get(dailyKey).cal===true&&store.get(dailyKey).training===true,'goal choices persist to the original dated record');
check(store.get(dailyKey).steps===false&&store.get(dailyKey).protein===false,'unchecked goals stay unchecked');

const weekStart=inline.indexOf('  function renderStepWeek(){');
const weekEnd=inline.indexOf("  $('#forgeFinishWalking')",weekStart);
check(weekStart>=0&&weekEnd>weekStart,'real 7-day history renderer found');
const weekKeyDate='2026-11-08';
const localDate=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const dateN=daysAgo=>{const d=new Date(weekKeyDate+'T12:00:00');d.setDate(d.getDate()-daysAgo);return localDate(d)};
store.set('fitness-planner-'+dateN(0),{steps:6500});
store.set('fitness-planner-'+dateN(1),{steps:11200});
store.set('fitness-planner-'+dateN(3),{steps:8300});
const doc={createElement(){return fake()}};
const makeHistory=new Function('$','document','storage','dateKey','localDate',inline.slice(weekStart,weekEnd)+'\nreturn renderStepWeek;');
makeHistory($,doc,storage,weekKeyDate,localDate)();
check(byId['#forgeStepWeekBars'].children.length===7,'weekly chart has exactly seven calendar days');
check(byId['#forgeStepWeekGoal'].textContent==='1 von 3 Tagen Ziel erreicht','only recorded days count toward reached goals');
check(byId['#forgeStepWeekCount'].textContent==='3 von 7 Tagen erfasst','missing days remain missing rather than zero');
check(byId['#forgeStepWeekAvg'].textContent.includes('8.667'),'mean uses recorded days, not seven zeros');
check(byId['#forgeStepWeekBars'].children.filter(x=>x.children[2].textContent==='—').length===4,'unrecorded days display em dashes');

const walkingStart=inline.indexOf('  function updateWalking(){');
const walkingEnd=inline.indexOf('  function selectWalkingMode(',walkingStart);
check(walkingStart>=0&&walkingEnd>walkingStart,'original walking engine found');
const walkingNodes=['walkingDone','walkingRemaining','walkingProgressFill','walkingProgressTrack',
  'walkingSyncNote','walkModeRemaining','walkModeCustom','walkSteps','otherSteps','paceError',
  'pace','stride','incline','walkingModeHint','forgeWalkNeeded','forgeWalkDistance',
  'forgeWalkPlanTitle','forgeWalkPlanSubtitle','heroSteps','heroPace','heroTime',
  'heroIncline','heroInclinePct','distance','duration','block1Steps','block2Steps',
  'block3Steps','b1','b2','b3','walkGoalLine','load','walkNote'];
for(const id of walkingNodes){if(!byId['#'+id])throw Error('Missing walking element '+id)}
byId['#pace'].value='6.2';byId['#stride'].value='0.76';
byId['#incline'].value='8';byId['#walkSteps'].value='8000';
byId['#otherSteps'].value='0';
const clamp=(n,min,max,fallback)=>Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;
const fmt2=n=>n.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmt1=n=>n.toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1});
const minutes=(steps,pace,stride)=>steps*stride/(pace*1000)*60;
const pref={pace:6.2,steps:8000,other:0,stride:.76,incline:8,mode:'remaining'};
const environment={body:{classList:{contains:c=>c==='forge-basics'}},
 querySelectorAll(){return[]}};
const makeWalking=new Function('$','document','storage','actualDailySteps','renderStepWeek','walkMode',
  'parsedPace','clamp','fmt1','fmt2','minutes','walkingPrefs',
  inline.slice(walkingStart,walkingEnd)+'\nreturn updateWalking;');
let actualSteps=6500;
const update=makeWalking($,environment,storage,()=>actualSteps,()=>{},'remaining',()=>6.2,clamp,fmt1,fmt2,minutes,pref);
update();
check(byId['#walkingRemaining'].textContent==='3.500'&&byId['#forgeWalkNeeded'].textContent==='3.500','Walking plans the true remainder without double counting');
const countBlocks=()=>[1,2,3].map(i=>Number(byId['#block'+i+'Steps'].textContent.replace(/[^\d]/g,'')));
check(countBlocks().join(',')==='1050,1050,1400','three blocks split the planned steps 30/30/40');
actualSteps=9999;update();
check(countBlocks().reduce((a,b)=>a+b,0)===1,'odd and small remaining counts never lose or add a step');
actualSteps=10000;update();
check(countBlocks().reduce((a,b)=>a+b,0)===0&&byId['#walkingRemaining'].textContent==='0','goal reached means no further planned blocks');
check(pref.steps===8000,'existing manual-plan steps are retained in storage preference');
console.log('FORGE restored basics: '+passed+' checks passed');
