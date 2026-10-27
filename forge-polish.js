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
   target.scrollIntoView({behavior:reduce?'instant':'smooth',block:'center'});
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
 $$('.daily').forEach(c=>c.addEventListener('change',render));
 const weightObserver=new MutationObserver(render);
 weightObserver.observe(latestWeight,{childList:true,subtree:true,characterData:true});
 render();
})();