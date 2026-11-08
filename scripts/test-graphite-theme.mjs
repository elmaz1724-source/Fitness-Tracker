#!/usr/bin/env node
// FORGE 8.2: restrained graphite surfaces + selective blue accent.
// Tests presentation invariants only. Never reads/writes fitness storage.
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const html=read('index.html');
const css=read('forge-polish.css');
const extras=read('forge-extras.css');
const icon=read('icon.svg');
const manifest=JSON.parse(read('manifest.webmanifest'));
const sw=read('sw.js');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
let passed=0;
const check=(ok,message)=>{if(!ok)throw Error('FORGE 8.2 graphite: '+message);passed++;};
check(!!script,'main script exists');
new Script(script);
check(html.includes('application-version" content="8.2.0"'),'app version is 8.2.0');
check(html.includes('<body class="forge-basics">'),'basic three-screen mode remains default');
const nav=html.slice(html.indexOf('<nav class="tabs"'),html.indexOf('</nav>')+6);
const tabs=[...nav.matchAll(/data-view="([^"]+)"/g)].map(m=>m[1]);
check(tabs.join(',')==='today,walking,progress,training','three core tabs with archived Training');
check(css.includes('.forge-basics .tabs>.tab[data-view="training"]{display:none!important}'),'Training hidden only in basic mode');
check(css.includes('--forge-tab-count:3'),'three visible nav tabs');
check(css.includes('background:#303238;')&&css.includes('.forge-basics nav.tabs .tab.active'),'active tab uses subtle graphite rather than solid blue');
check(css.includes('.forge-basics nav.tabs .tab.active svg{color:#87b8fc'),'blue limited to selected nav icon');
check(css.includes('body.forge-basics{\n  background:#101114;'),'canvas is neutral graphite without blue ambient glow');
check(css.includes('--forge-canvas:#101114')&&css.includes('--forge-surface:#1b1d22'),'graphite design tokens set');
check(css.includes('--forge-border:#30333a')&&css.includes('--forge-text:#f5f6f8'),'legible neutral text and subtle borders');
check(css.includes('.forge-basics #today .forge-step-stat strong.forge-step-done')&&
      css.includes('color:#f5f6f8;'),'large step values are white, not all blue');
check(css.includes('background:#82b4ff;')&&css.includes('#forgeStepFill'),'progress bars retain one blue accent');
check(css.includes('.forge-basics #today .forge-step-save,')&&
      css.includes('.forge-basics #progress #addWeight{'),'Save buttons share the same blue CTA');
check(css.includes('.forge-basics #walking .forge-walk-finish-btn{\n  background:#2b2e34;'),'secondary walking action stays neutral');
check(css.includes('.forge-basics #walking .forge-walk-plan-card{order:1}')&&
      css.includes('.forge-basics #walking .forge-basics-walking-controls{order:2}'),'walking time remains before speed and incline fields');
check(html.includes('id="forgeSnapSteps"')&&html.includes('id="forgeSnapLeft"')&&
      html.includes('id="forgeStepSave"'),'Today still has one canonical step entry');
check(html.includes('id="forgeBasicsPace"')&&html.includes('id="forgeBasicsIncline"')&&
      html.includes('id="heroTime"'),'Walking calculations and inputs remain intact');
check(html.includes('id="weightValue"')&&html.includes('id="addWeight"')&&
      html.includes('id="weightChart"'),'weight form and actual measurement chart preserved');
check(html.includes('fitness-planner-')&&html.includes('fitness-walking')&&
      html.includes('fitness-weights'),'existing storage keys unchanged');
check(!html.includes('id="foodLog"'),'no nutrition feature added');
check(html.includes('name="theme-color" content="#101114"')&&
      manifest.theme_color==='#101114'&&manifest.background_color==='#101114','iOS and PWA background match graphite');
check(icon.includes('fill="#101114"')&&icon.includes('stroke="#f3f4f7"')&&
      icon.includes('stroke="#82b4ff"'),'icon uses mostly monochrome with small blue arrow accent');
check(sw.includes('forge-shell-v8-2-0'),'offline cache refreshes for new design');
check(css.includes('@media(prefers-reduced-motion:reduce)'),'reduced motion maintained');
for(const [path,body] of [['forge-polish.css',css],['forge-extras.css',extras]]){
 check((body.match(/\{/g)||[]).length===(body.match(/\}/g)||[]).length,path+' braces balanced');
}
const lum=h=>h.match(/\w\w/g).slice(0,3).map(x=>parseInt(x,16)/255)
  .map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
  .reduce((acc,c,i)=>acc+c*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{const [hi,lo]=[lum(a),lum(b)].sort((a,b)=>b-a);return(hi+.05)/(lo+.05)};
check(contrast('f5f6f8','1b1d22')>=7,'white copy on graphite AAA contrast');
check(contrast('a7abb4','1b1d22')>=4.5,'secondary graphite text AA contrast');
check(contrast('82b4ff','101114')>=4.5,'accent on dark canvas AA contrast');
check(contrast('0b192a','82b4ff')>=4.5,'button label on blue AA contrast');
console.log('FORGE graphite-accent UI: '+passed+' checks passed');
