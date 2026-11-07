/* FORGE 7.6 — familiar navigation, top-right settings and browser history.
   Pure presentation/navigation: never reads or writes fitness data. */
(()=>{
  'use strict';
  const settings=document.getElementById('forgeHeaderMenu');
  const tabs=[...document.querySelectorAll('.tab[data-view]')];
  const valid=new Set(['today','walking','progress','training']);
  const activeView=()=>tabs.find(tab=>tab.classList.contains('active'))?.dataset.view||'today';
  let restoring=false;

  // Back gestures are the browser's responsibility. Recording tab visits
  // makes browser-back navigate through previous tabs without hijacking swipes.
  if(window.history&&typeof history.replaceState==='function'){
    try{
      const prior=history.state&&typeof history.state==='object'?history.state:{};
      if(!valid.has(prior.forgeView)){
        history.replaceState({...prior,forgeView:activeView()},'',location.href);
      }
    }catch{/* History may be unavailable in restricted embedded browsers. */}
  }

  tabs.forEach(tab=>tab.addEventListener('click',()=>{
    const view=tab.dataset.view;
    if(restoring||!valid.has(view))return;
    if(!window.history||typeof history.pushState!=='function')return;
    const current=history.state&&typeof history.state==='object'?history.state:{};
    if(current.forgeView===view)return;
    try{
      if(location.hash.startsWith('#forge-sync?')){
        // The Health bridge opens Training programmatically. Update the current
        // state only: never add a separate back-history entry with health values.
        history.replaceState({...current,forgeView:view},'',location.href);
      }else{
        history.pushState({...current,forgeView:view},'',location.href);
      }
    }catch{/* Do not block tab navigation if the host rejects history changes. */}
  }));

  window.addEventListener('popstate',event=>{
    const next=valid.has(event.state?.forgeView)?event.state.forgeView:'today';
    const tab=tabs.find(item=>item.dataset.view===next);
    if(!tab)return;
    restoring=true;
    try{tab.click();}finally{restoring=false;}
    if(settings)settings.open=false;
  });

  const closeMenu=()=>{if(settings)settings.open=false;};
  if(!settings)return;
  const trigger=settings.querySelector('summary');
  settings.querySelectorAll('button[data-forge-menu-view]').forEach(button=>{
    button.addEventListener('click',()=>{
      const view=button.dataset.forgeMenuView;
      const id=button.dataset.forgeMenuTarget;
      if(!valid.has(view))return;
      const destination=document.getElementById(id);
      if(!destination)return;
      const tab=tabs.find(item=>item.dataset.view===view);
      closeMenu();
      if(tab&&activeView()!==view)tab.click();
      // The destination belongs to an existing tab; no profile or fifth tab added.
      destination.scrollIntoView({block:'start',behavior:'auto'});
      if(typeof destination.focus==='function')destination.focus({preventScroll:true});
    });
  });
  document.addEventListener('pointerdown',event=>{
    if(settings.open&&!settings.contains(event.target))closeMenu();
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&settings.open){
      closeMenu();
      trigger?.focus();
    }
  });
})();