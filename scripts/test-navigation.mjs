#!/usr/bin/env node
// Regression tests for native-style FORGE navigation; no DOM dependency or user data.
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const src=readFileSync(resolve(fileURLToPath(new URL('../forge-navigation.js', import.meta.url))), 'utf8');

function setup(hash=''){
  const listeners={};
  const location={href:'https://example.test/Fitness-Tracker/?v=760'+hash,hash};
  const stack=[null];let index=0;
  const history={
    get state(){return stack[index]},
    replaceState(state){stack[index]=state},
    pushState(state){stack.splice(index+1);stack.push(state);index++},
    back(){
      if(index<=0)return;
      index--;
      for(const cb of listeners.popstate||[])cb({state:stack[index]});
    }
  };
  const window={history,addEventListener(k,fn){(listeners[k]??=[]).push(fn)}};
  const tabs=['today','walking','progress','training'].map(view=>{
    const classes=new Set(view==='today'?['active']:[]);
    return {
      dataset:{view},listeners:{},
      classList:{contains:c=>classes.has(c)},
      addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)},
      click(){
        for(const item of tabs)item._active=false;
        this._active=true;
        for(const cb of this.listeners.click||[])cb();
      },
      get active(){return !!this._active}
    };
  });
  tabs.forEach((tab,i)=>{tab._active=i===0;tab.classList.contains=c=>c==='active'&&tab._active});
  const sections=Object.fromEntries(
    ['forgeReminderSettings','forgeSyncSection','forgeBackupSettings','forgeInstallSettings']
    .map(id=>[id,{id,scrolls:0,focuses:0,
      scrollIntoView(){this.scrolls++},focus(){this.focuses++}}]));
  const trigger={focuses:0,focus(){this.focuses++}};
  const buttons=[
    ['training','forgeReminderSettings'],
    ['training','forgeSyncSection'],
    ['progress','forgeBackupSettings'],
    ['training','forgeInstallSettings']
  ].map(([forgeMenuView,forgeMenuTarget])=>({
    dataset:{forgeMenuView,forgeMenuTarget},handlers:{},
    addEventListener(k,fn){this.handlers[k]=fn},
    click(){this.handlers.click()}
  }));
  const menu={
    open:false,querySelector(){return trigger},querySelectorAll(){return buttons},
    contains(target){return target===menu||target===trigger||buttons.includes(target)}
  };
  const document={
    events:{},getElementById(id){return id==='forgeHeaderMenu'?menu:sections[id]||null},
    querySelectorAll(sel){if(sel!=='.tab[data-view]')throw Error('Unexpected query: '+sel);return tabs},
    addEventListener(k,fn){(this.events[k]??=[]).push(fn)}
  };
  runInNewContext(src,{document,window,history,location});
  return {history,stack,tabs,buttons,menu,trigger,sections,document,
    active:()=>tabs.find(t=>t.active)?.dataset.view};
}
function test(ok,label){if(!ok)throw Error('FORGE navigation: '+label);count++;}
let count=0;
const app=setup();
test(app.history.state.forgeView==='today','initial Home state');
app.tabs[1].click();
test(app.active()==='walking'&&app.stack.length===2,'walking creates browser history');
app.tabs[1].click();
test(app.stack.length===2,'same tab does not duplicate history');
app.tabs[3].click();
app.history.back();
test(app.active()==='walking'&&app.stack.length===3,'back restores previous tab without looping');
app.menu.open=true;app.buttons[0].click();
test(app.active()==='training'&&app.sections.forgeReminderSettings.scrolls===1&&
  app.sections.forgeReminderSettings.focuses===1&&!app.menu.open,'reminders shortcut');
app.menu.open=true;app.buttons[2].click();
test(app.active()==='progress'&&app.sections.forgeBackupSettings.scrolls===1,'backup shortcut');
app.menu.open=true;
app.document.events.pointerdown[0]({target:{}});
test(!app.menu.open,'outside pointer dismisses menu');
app.menu.open=true;
app.document.events.keydown[0]({key:'Escape'});
test(!app.menu.open&&app.trigger.focuses===1,'Escape returns focus to settings trigger');
const bridge=setup('#forge-sync?date=2026-11-07&steps=8500');
bridge.tabs[3].click();
test(bridge.stack.length===1&&bridge.history.state.forgeView==='training',
  'Health fragment navigation updates only current state');
test(app.stack.every(s=>Object.keys(s).every(k=>k==='forgeView')),
  'browser history contains no fitness data');
console.log('FORGE navigation: '+count+' tests passed');
