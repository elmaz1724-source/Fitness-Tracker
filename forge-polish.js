/* FORGE 6 — presentation only. Never overwrites workouts, weight or daily data. */
(()=>{
 'use strict';
 const $=selector=>document.querySelector(selector);
 const steps=$('#plannerSteps'),latestWeight=$('#currentWeight');
 if(!steps||!latestWeight)return;
 const num=n=>Math.max(0,Math.min(50000,Number(n)||0));
 const formatted=n=>Math.round(n).toLocaleString('de-DE');
 const render=()=>{
   const done=num(steps.value),left=Math.max(0,10000-done);
   const weight=latestWeight.textContent.trim();
   $('#forgeSnapSteps').textContent=formatted(done);
   $('#forgeSnapLeft').textContent=formatted(left);
   $('#forgeSnapWeight').textContent=weight==='—'?'—':weight;
   const finished=Number(String($('#ringScore').textContent).split('/')[0])||0;
   const tip=left===0
     ?'Dein Schrittziel ist erreicht. Ein bisschen Regeneration zählt ebenfalls.'
     :formatted(left)+' Schritte bis zu deinem Ziel · '+finished+' von 5 Tageszielen abgehakt.';
   $('#forgeLiveText').textContent=tip;
 };
 const goTo=selector=>{
   const target=$(selector);
   if(!target)return;
   const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   target.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
 };
 $('#forgeGoSteps').addEventListener('click',()=>{
   goTo('#forgeTodayTools');
   if(window.innerWidth>600)$('#forgeQuickSteps')?.focus({preventScroll:true});
 });
 $('#forgeGoWalking').addEventListener('click',()=>goTo('#plannerTitle'));
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