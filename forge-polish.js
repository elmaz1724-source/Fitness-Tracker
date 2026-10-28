/* FORGE 7.1 — focused daily steps UX; reuses existing persistent fitness planner. */
(()=>{
 'use strict';
 const $=selector=>document.querySelector(selector);
 const steps=$('#plannerSteps'),latestWeight=$('#currentWeight');
 if(!steps||!latestWeight)return;
 const num=n=>Math.max(0,Math.min(50000,Number(n)||0));
 const formatted=n=>Math.round(n).toLocaleString('de-DE');
 const render=()=>{
   const done=num(steps.value),left=Math.max(0,10000-done),percent=Math.min(100,Math.round(done/10000*100));
   const weight=latestWeight.textContent.trim();
   $('#forgeSnapSteps').textContent=formatted(done);
   $('#forgeSnapLeft').textContent=formatted(left);
   $('#forgeSnapWeight').textContent=weight==='—'?'—':weight;
   $('#forgeStepPercent').textContent=percent+' %';
   $('#forgeStepFill').style.width=percent+'%';
   $('#forgeStepProgress').setAttribute('aria-valuenow',String(percent));
   $('#forgeStepNote').textContent=left===0
     ?'Ziel erreicht! Du bist heute '+formatted(done)+' Schritte gelaufen.'
     :'Du hast '+formatted(done)+' Schritte geschafft. Nur noch '+formatted(left)+' bis zu deinem Tagesziel.';
   const edit=$('#forgeStepInput');
   if(document.activeElement!==edit)edit.value=String(done);
   const finished=Number(String($('#ringScore').textContent).split('/')[0])||0;
   $('#forgeLiveText').textContent=left===0
     ?'Schrittziel erreicht! '+finished+' von 5 Tageszielen abgehakt.'
     :formatted(left)+' Schritte bis zu deinem Ziel · '+finished+' von 5 Tageszielen abgehakt.';
 };
 const goTo=selector=>{
   const target=$(selector);
   if(!target)return;
   const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   target.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
 };
 const stepInput=$('#forgeStepInput'),feedback=$('#forgeStepFeedback');
 function updateSteps(){
   const raw=stepInput.value.trim(),value=Number(raw);
   if(!/^\d+$/.test(raw)||!Number.isSafeInteger(value)||value<0||value>50000){
     feedback.textContent='Bitte gib eine ganze Schrittzahl zwischen 0 und 50.000 ein.';
     feedback.classList.add('error');
     return;
   }
   // Reuse the existing save path: localStorage key, planner and all dependent views.
   $('#forgeQuickSteps').value=String(value);
   $('#forgeSaveSteps').click();
   const saved=Number(steps.value)===value;
   feedback.textContent=saved
     ?formatted(value)+' Schritte gespeichert. Bis 10.000 fehlen noch '+formatted(Math.max(0,10000-value))+'.'
     :'Der Wert konnte nicht gespeichert werden. Prüfe deine Eingabe.';
   feedback.classList.toggle('error',!saved);
   render();
   stepInput.blur();
 }
 $('#forgeStepSave').addEventListener('click',updateSteps);
 stepInput.addEventListener('keydown',event=>{
   if(event.key==='Enter'){event.preventDefault();updateSteps();}
 });
 $('#forgeGoSteps').addEventListener('click',()=>{
   goTo('#forgeStepsCenter');
   stepInput.focus({preventScroll:true});
   stepInput.select();
 });
 $('#forgeGoWalking').addEventListener('click',()=>{
   $('#forgePlannerDetails').open=true;
   goTo('#forgePlannerDetails');
 });
 $('#forgeGoWeight').addEventListener('click',()=>{
   const tab=$('.tab[data-view="progress"]');
   if(tab)tab.click();
   const title=$('#progress .mini-header');
   if(title)goTo('#progress .mini-header');
 });
 steps.addEventListener('input',render);
 ['forgeSaveSteps','forgeSaveWeight','addWeight'].forEach(id=>{
   const b=$('#'+id);if(b)b.addEventListener('click',render);
 });
 document.querySelectorAll('.daily').forEach(c=>c.addEventListener('change',render));
 const weightObserver=new MutationObserver(render);
 weightObserver.observe(latestWeight,{childList:true,subtree:true,characterData:true});
 async function checkPagesBuild(){
   const status=$('#forgeBuildStatus');
   if(!status)return;
   const embedded=document.querySelector('meta[name="application-version"]')?.getAttribute('content')||'unbekannt';
   if(navigator.onLine===false){
     status.textContent='Offline: FORGE '+embedded+' ist installiert. Online erneut öffnen, um die Veröffentlichungs-ID zu prüfen.';
     return;
   }
   try{
     const url='./build-info.json?check='+Date.now();
     const response=await fetch(url,{cache:'no-store'});
     if(!response.ok)throw new Error('build-info nicht erreichbar (HTTP '+response.status+')');
     const build=await response.json();
     if(build.app!=='FORGE'||typeof build.commit!=='string'||!/^[0-9a-f]{40}$/.test(build.commit)){
       throw new Error('Build-Information ungültig');
     }
     if(build.version===embedded){
       status.textContent='✓ GitHub Pages bestätigt: FORGE '+build.version+' · Commit '+build.commit.slice(0,9)+'. Die veröffentlichte Version stimmt mit dieser App überein.';
     }else{
       status.textContent='! Versionskonflikt: Website-Build '+build.version+', geladene App '+embedded+'. Bitte die Seite online neu laden.';
     }
   }catch(error){
     status.textContent='! Veröffentlichung noch nicht verifiziert ('+error.message+'). Prüfe in GitHub den Pages-Workflow unter Actions.';
   }
 }
 checkPagesBuild();
 window.addEventListener('online',checkPagesBuild);
 render();
})();