/* FORGE 8: less interface, same fitness data.
   The basics view is a purely visual default; old tools stay available. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const toggle=$('forgeBasicsToggle');
 const backup=$('forgeBasicsBackup');
 const menu=$('forgeHeaderMenu');
 const pace=$('pace');
 const incline=$('incline');
 const simplePace=$('forgeBasicsPace');
 const simpleIncline=$('forgeBasicsIncline');
 const grade=$('inclineGrade');
 const simpleGrade=$('forgeBasicsGrade');
 const inclineUnit=$('inclineUnit');
 const simpleInclineUnit=$('forgeBasicsInclineUnit');
 const simpleDegrees=$('forgeBasicsDegrees');
 const simplePercent=$('forgeBasicsPercent');
 const simpleInclineLabel=$('forgeBasicsInclineLabel');
 const status=$('forgeBasicsPaceFeedback');
 if(!toggle||!pace||!incline||!simplePace||!simpleIncline||!grade||!simpleGrade||!inclineUnit||!simpleInclineUnit||!simpleDegrees||!simplePercent||!simpleInclineLabel)return;

 function syncInputs(){
   if(document.activeElement!==simplePace)simplePace.value=pace.value;
   if(document.activeElement!==simpleIncline)simpleIncline.value=incline.value;
   if(simpleGrade.innerHTML!==grade.innerHTML)simpleGrade.innerHTML=grade.innerHTML;
   if(document.activeElement!==simpleGrade)simpleGrade.value=grade.value;
   simpleInclineUnit.value=inclineUnit.value;
   const percentage=inclineUnit.value==='percent';
   simpleIncline.hidden=percentage;
   simpleGrade.hidden=!percentage;
   simpleDegrees.classList.toggle('is-active',!percentage);
   simplePercent.classList.toggle('is-active',percentage);
   simpleDegrees.setAttribute('aria-pressed',String(!percentage));
   simplePercent.setAttribute('aria-pressed',String(percentage));
   simpleInclineLabel.textContent=percentage?'Steigung (%)':'Neigung (°)';
   status.textContent=$('paceError')?.textContent.trim()||'';
 }

 function refreshWalking(){
   // The existing Walking calculator owns the formulas, validation and persistence.
   pace.dispatchEvent(new Event('input',{bubbles:true}));
   syncInputs();
 }
 function setBasics(enabled){
   if(enabled&&document.querySelector('.tab[data-view="training"]')?.classList.contains('active')){
     document.querySelector('.tab[data-view="today"]')?.click();
   }
   document.body.classList.toggle('forge-basics',enabled);
   if(!enabled){
     // In simple mode calculations always use the remaining steps; the saved custom
     // walking plan is not overwritten and can be restored on opening the archive.
     try{
       const settings=JSON.parse(localStorage.getItem('fitness-walking')||'{}');
       if(settings.mode==='custom'){
         if(Number.isFinite(settings.steps))$('walkSteps').value=String(settings.steps);
         if(Number.isFinite(settings.other))$('otherSteps').value=String(settings.other);
         $('forgeWalkAdvanced').open=true;
       }else{
         $('forgeWalkAdvanced').open=false;
       }
     }catch{/* Keep current input values if storage is inaccessible. */}
   }
   toggle.innerHTML=enabled
      ?'Weitere Funktionen öffnen <span aria-hidden="true">↗</span>'
      :'Zur einfachen Ansicht <span aria-hidden="true">↙</span>';
   toggle.setAttribute('aria-pressed',String(!enabled));
   if(menu)menu.open=false;
   refreshWalking();
 }

 toggle.addEventListener('click',()=>setBasics(!document.body.classList.contains('forge-basics')));
 backup?.addEventListener('click',()=>{
   menu.open=false;
   const action=$('exportData');
   if(action){
     action.click();
     $('forgeBasicsNote').textContent='Backup angefordert. Prüfe deine Downloads und sichere die Datei.';
   }
 });
 simplePace.addEventListener('input',()=>{
   pace.value=simplePace.value;
   refreshWalking();
 });
 simpleIncline.addEventListener('input',()=>{
   incline.value=simpleIncline.value;
   refreshWalking();
 });
 simpleGrade.addEventListener('change',()=>{
   grade.value=simpleGrade.value;
   grade.dispatchEvent(new Event('change',{bubbles:true}));
   syncInputs();
 });
 simpleInclineUnit.addEventListener('change',()=>{
   inclineUnit.value=simpleInclineUnit.value;
   inclineUnit.dispatchEvent(new Event('change',{bubbles:true}));
   syncInputs();
 });
 function setUnitFromSimple(unit){
   // Dispatch through the calculator's existing unit switch to keep units
   // consistent across the simple view, advanced tools and stored plan.
   simpleInclineUnit.value=unit;
   simpleInclineUnit.dispatchEvent(new Event('change',{bubbles:true}));
 }
 simpleDegrees.addEventListener('click',()=>setUnitFromSimple('degrees'));
 simplePercent.addEventListener('click',()=>setUnitFromSimple('percent'));
 pace.addEventListener('input',syncInputs);
 incline.addEventListener('input',syncInputs);
 grade.addEventListener('change',syncInputs);
 inclineUnit.addEventListener('change',syncInputs);

 // iOS Shortcut links target a section of the archived interface.
 // Open it before the Health bridge runs; do not modify its URL or saved values.
 if(location.hash.startsWith('#forge-sync?')){
   setBasics(false);
 }else{
   syncInputs();
   toggle.innerHTML='Weitere Funktionen öffnen <span aria-hidden="true">↗</span>';
   toggle.setAttribute('aria-pressed','false');
 }

 // If browser back restores the archived Training view, make it visible.
 window.addEventListener('popstate',event=>{
   if(event.state?.forgeView==='training'&&document.body.classList.contains('forge-basics')){
     setBasics(false);
   }
 });
})();