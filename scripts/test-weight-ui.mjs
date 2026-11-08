#!/usr/bin/env node
// FORGE 8.4: real weight save / responsive chart regression tests.
// Exercises existing application logic with in-memory data only.
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const html=read('index.html'),css=read('forge-polish.css');
const inline=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
let total=0;
const check=(ok,label)=>{if(!ok)throw Error('Weight UI test: '+label);total++};
check(!!inline,'inline application source exists');
new Script(inline);
check(html.includes('application-version" content="8.4.0"'),'release version 8.4.0');
check(html.includes('class="card forge-weight-entry-card"'),'original card uses explicit styling');
check(html.includes('class="grid2 forge-weight-entry-grid"'),'form uses a dedicated grid');
check(/id="weightDate" type="date"[^>]*>/.test(html),'date stays native, editable and can be backdated');
check(!/id="weightDate"[^>]*readonly/.test(html),'date entry is not read-only');
check(/id="weightValue"[^>]*min="50" max="200" step="0.1"/.test(html),'original weight bounds and precision remain');
check(html.includes('id="weightFeedback" role="status" aria-live="polite"'),'save message is announced accessibly');
check(html.includes('class="chart forge-weight-chart-card"'),'original trend chart has a dedicated layout');
check(html.includes('id="weightChart"')&&html.includes('role="img"'),'chart remains screen-reader labeled');
check(css.includes('grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr)'),'wide fields use intrinsic-safe grid');
check(css.includes('@media(max-width:520px){')&&
  css.includes('#progress .grid2.forge-weight-entry-grid{grid-template-columns:minmax(0,1fr);gap:15px}'),
  'phone fields stack to prevent native date picker overlap');
check(css.includes('min-width:0; /* prevents native iOS date input'),'iOS date control can shrink within its grid cell');
check(css.includes('font-size:18px')&&css.includes('min-height:56px'),'inputs are touchable and avoid iOS font zoom');
check(css.includes('#progress #addWeight.forge-weight-save{'),'save button has explicit priority over legacy CSS');
check(css.includes('#progress .feedback.forge-weight-feedback{'),'help text is an unboxed secondary message');
check(css.includes('background:transparent;\n  border:0;'),'help message does not create another colored panel');
check(css.includes('.forge-weight-chart-heading .legend'),'chart legend flows with the heading');
check(css.includes('.forge-weight-chart-card #weightChart'),'chart fills its available card width');
check(html.includes('fitness-weights')&&html.includes('fitness-planner-'),'old storage keys remain unchanged');
check(html.includes('id="forgeSnapSteps"')&&html.includes('id="forgeBasicsPace"'),'steps and Walking controls remain in place');
check(!html.includes('id="foodLog"'),'no new food tracking');

const grab=(start,end,label)=>{
 const a=inline.indexOf(start),b=inline.indexOf(end,a+start.length);
 if(a<0||b<a)throw Error('Missing source boundaries: '+label);
 return inline.slice(a,b);
};
const chartSrc=grab('  function drawChart(){','  // Only redraw when crossing the mobile/desktop chart breakpoint.', 'chart renderer');
const dayNumber=s=>Math.round(Date.parse(s+'T00:00:00Z')/86400000);
const weights=[
 {date:'2026-10-29',value:93.1},
 {date:'2026-10-31',value:92.7},
 {date:'2026-11-05',value:92.5},
 {date:'2026-11-08',value:92.2}
];
const german=(n,decimals=1)=>n.toLocaleString('de-DE',{minimumFractionDigits:decimals,maximumFractionDigits:decimals});
function chartAt(width,records=weights){
 const svg={innerHTML:'',attrs:{},setAttribute(k,v){this.attrs[k]=v}};
 const window={innerWidth:width};
 const draw=new Function('$','window','weights','weightDay','spanForDay','german',
   chartSrc+'\nreturn drawChart;')(
     sel=>{if(sel!=='#weightChart')throw Error('Wrong chart selector');return svg},
     window,records,w=>dayNumber(w.date),()=>({avg:92.6}),german);
 draw();
 return svg;
}
const small=chartAt(375);
check(small.attrs.viewBox==='0 0 340 244','phone receives truly mobile-sized SVG axes');
check(small.innerHTML.includes('text-anchor="start"')&&small.innerHTML.includes('text-anchor="end"'),
  'first and last date labels stay within the chart');
check(small.innerHTML.includes('7-Tage-Ø'),'average series still rendered');
const desktop=chartAt(1024);
check(desktop.attrs.viewBox==='0 0 720 290','desktop preserves original detailed chart proportions');
check(desktop.innerHTML.includes('stroke="#82b4ff"'),'average chart retains restrained accent blue');
const empty=chartAt(375,[]);
check(empty.innerHTML.includes('Noch keine Gewichtsaufzeichnungen'),'no-measurement state remains readable');
check(empty.attrs.viewBox==='0 0 340 244','empty state scales for mobile too');

const clickSrc=grab("  $('#addWeight').addEventListener('click',()=>{","  $$('.goal-option')","weight save handler");
const dateInput={value:'2026-11-08'};
const valueInput={value:'92.6'},feedback={textContent:'',dataset:{}};
let onSave,renderCount=0;
const saved=new Map(),persist={set(k,v){saved.set(k,JSON.parse(JSON.stringify(v)))}};
const $=sel=>{
 if(sel==='#addWeight')return{addEventListener(type,fn){if(type==='click')onSave=fn}};
 if(sel==='#weightValue')return valueInput;
 if(sel==='#weightFeedback')return feedback;
 throw Error('Unexpected weight selector '+sel);
};
const records=[];
new Function('$','dateInput','weights','storage','renderWeights','dayNumber','localDate',
  clickSrc)($,dateInput,records,persist,()=>{renderCount++},dayNumber,()=>dateInput.value);
check(typeof onSave==='function','original save action is still bound');
onSave();
check(saved.get('fitness-weights')?.length===1&&saved.get('fitness-weights')[0].value===92.6,
  'valid weight is persisted in the original fitness-weights key');
check(feedback.dataset.state==='success'&&renderCount===1,'success updates trend and inline feedback');
valueInput.value='91.9';onSave();
check(saved.get('fitness-weights')?.length===1&&saved.get('fitness-weights')[0].value===91.9,
  'saving the same date replaces that entry without duplicates');
valueInput.value='230';onSave();
check(saved.get('fitness-weights')?.length===1&&feedback.dataset.state==='error',
  'invalid weights do not mutate saved data and show a visible error');
console.log('FORGE weight entry & chart: '+total+' checks passed');
