#!/usr/bin/env node
// FORGE 8.1 — color and three-screen smoke checks; does not touch user fitness data.
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const h=read('index.html'),polish=read('forge-polish.css'),extras=read('forge-extras.css');
const icon=read('icon.svg'),manifest=JSON.parse(read('manifest.webmanifest')),sw=read('sw.js');
const inline=h.match(/<script>([\s\S]*?)<\/script>/)?.[1];
const check=(condition,message)=>{if(!condition)throw Error('FORGE 8.1 design: '+message);passed++;};
let passed=0;
check(!!inline,'app main script exists');
new Script(inline);
check(h.includes('application-version" content="8.1.0"'),'correct app version');
check(h.includes('<body class="forge-basics">'),'three-screen basic mode remains default');
const nav=h.slice(h.indexOf('<nav class="tabs"'),h.indexOf('</nav>')+6);
const views=[...nav.matchAll(/data-view="([^"]+)"/g)].map(m=>m[1]);
check(views.join(',')==='today,walking,progress,training','three core views with archived Training tab');
check(polish.includes('.forge-basics .tabs>.tab[data-view="training"]{display:none!important}'),'archived tab hidden in basic mode');
check(polish.includes('--forge-tab-count:3'),'three visible bottom navigation tabs');
check(polish.includes('background:linear-gradient(135deg,#81c0ff,#549af4)'),'blue active tab');
check(h.includes('--accent:#6aadff')&&polish.includes('--accent:#6aadff'),'consistent blue primary brand');
check(polish.includes('--forge-blue-soft:#96caff')&&polish.includes('--forge-blue-strong:#3c82ea'),'Midnight Blue design tokens');
check(manifest.theme_color==='#0a101b'&&manifest.background_color==='#0a101b','PWA theme matches navy background');
check(h.includes('name="theme-color" content="#0a101b"'),'iOS status bar matches PWA');
check(icon.includes('stroke="#5da2f6"')&&!icon.includes('#c3f65d'),'blue PWA app icon');
check(sw.includes("forge-shell-v8-1-0"),'offline cache is updated');
check(h.includes('id="forgeSnapSteps"')&&h.includes('id="forgeSnapLeft"')&&h.includes('id="forgeStepSave"'),'actual steps and remaining steps preserved');
check(h.includes('id="forgeBasicsPace"')&&h.includes('id="forgeBasicsIncline"')&&h.includes('id="heroTime"'),'Walking remains editable with estimated time');
check(polish.includes('.forge-basics #walking .forge-walk-plan-card{order:1}')&&
      polish.includes('.forge-basics #walking .forge-basics-walking-controls{order:2}'),'Walking duration is displayed before optional settings');
check(h.includes('Die Gehzeit hängt von deinem Tempo und deiner Schrittlänge ab.'),'incline duration misconception corrected');
check(h.includes('id="weightValue"')&&h.includes('id="addWeight"')&&h.includes('id="weightChart"'),'weight entry and graph remain intact');
check(h.includes('fitness-planner-')&&h.includes('fitness-weights')&&h.includes('fitness-walking'),'original local fitness data schema preserved');
check(!h.includes('id="foodLog"'),'no nutrition logger added');
check(!h.includes('Der grüne Verlauf'),'outdated chart legend color removed');
check(polish.includes('@media(prefers-reduced-motion:reduce)'),'reduced motion preserved');
for(const [path,css] of [['forge-polish.css',polish],['forge-extras.css',extras]]){
 const opened=(css.match(/\{/g)||[]).length,closed=(css.match(/\}/g)||[]).length;
 check(opened===closed,path+' CSS braces are balanced');
}
const banned=['#c9ff6a','#c3f65d','#52d7ad','#89df8d','#a5e86c'];
check(!banned.some(color=>[h,polish,extras,icon].some(s=>s.toLowerCase().includes(color))),'old lime brand colors absent');

function luminance(hex){
 const values=hex.match(/\w\w/g).slice(0,3).map(v=>parseInt(v,16)/255)
   .map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));
 return values[0]*.2126+values[1]*.7152+values[2]*.0722;
}
function contrast(a,b){
 const l=[luminance(a),luminance(b)].sort((x,y)=>y-x);
 return (l[0]+.05)/(l[1]+.05);
}
check(contrast('6aadff','0a101b')>=4.5,'blue action contrast on navy canvas');
check(contrast('0b223e','6aadff')>=4.5,'button label contrast on blue');
check(contrast('9caec4','0a101b')>=4.5,'secondary text contrast on dark background');
console.log('FORGE blue core UI: '+passed+' checks passed');
