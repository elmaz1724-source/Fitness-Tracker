/* FORGE 7.0 — local-only Apple Shortcuts link bridge and iPhone Calendar export. */
(()=>{
  'use strict';
  const $=selector=>document.querySelector(selector);
  const LOCAL_KEY='forge-last-sync-v1';
  const BASE_URL='https://elmaz1724-source.github.io/Fitness-Tracker/';
  const pad=n=>String(n).padStart(2,'0');
  const localDate=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
  const today=()=>localDate(new Date());
  const read=(key,fallback)=>{
    try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw);}catch{return fallback;}
  };
  const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
  const status=(id,message,error=false)=>{
    const e=$(id);if(!e)return;e.textContent=message;e.classList.toggle('error',error);
  };
  const german=n=>Number(n).toLocaleString('de-DE',{maximumFractionDigits:2});
  function validDate(s){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return false;
    const t=new Date(s+'T12:00:00Z');
    return !Number.isNaN(t.getTime())&&t.toISOString().slice(0,10)===s&&s<=today();
  }
  function parseBridgeHash(rawHash){
    if(!rawHash.startsWith('#forge-sync?'))return null;
    if(rawHash.length>240)throw new Error('Übertragungslink zu lang.');
    const query=rawHash.slice('#forge-sync?'.length);
    const args=new URLSearchParams(query);
    for(const key of args.keys()){
      if(!['date','steps','weight'].includes(key)||args.getAll(key).length!==1){
        throw new Error('Unerwarteter oder mehrfach übergebener Parameter: '+key);
      }
    }
    const date=args.get('date');
    if(!validDate(date))throw new Error('Ungültiges Datum. In Kurzbefehle bitte yyyy-MM-dd verwenden und keinen zukünftigen Tag senden.');
    const rawSteps=args.get('steps'),rawWeight=args.get('weight');
    if(rawSteps===null&&rawWeight===null)throw new Error('Bitte Schritte und/oder Gewicht im Übertragungslink angeben.');
    const result={date};
    if(rawSteps!==null){
      if(!/^\d{1,5}$/.test(rawSteps))throw new Error('Schritte müssen eine ganze Zahl zwischen 0 und 50.000 sein.');
      const number=Number(rawSteps);
      if(!Number.isSafeInteger(number)||number>50000)throw new Error('Schrittzahl außerhalb des erlaubten Bereichs.');
      result.steps=number;
    }
    if(rawWeight!==null){
      const weightRaw=rawWeight.trim().replace(',','.');
      if(!/^\d{2,3}(?:\.\d{1,2})?$/.test(weightRaw))throw new Error('Das Gewicht muss als Kilogrammzahl angegeben werden, z. B. 92,4.');
      const number=Number(weightRaw);
      if(!Number.isFinite(number)||number<50||number>200)throw new Error('Gewicht muss zwischen 50 und 200 kg liegen.');
      result.weight=Math.round(number*100)/100;
    }
    return result;
  }
  function displayLastSync(){
    const last=read(LOCAL_KEY,null);
    if(!last||typeof last!=='object'||!validDate(last.date)){
      $('#forgeLastSyncDate').textContent='Noch nie';
      $('#forgeLastSyncDetails').textContent='Noch keine Daten aus einem Kurzbefehl';
      return;
    }
    $('#forgeLastSyncDate').textContent=last.date.split('-').reverse().join('.');
    const parts=[];
    if(Number.isSafeInteger(last.steps))parts.push(german(last.steps)+' Schritte');
    if(Number.isFinite(last.weight))parts.push(german(last.weight)+' kg');
    $('#forgeLastSyncDetails').textContent=parts.join(' · ')||'Datenübernahme gespeichert';
  }
  function cleanHash(){
    // Fragments are not sent to GitHub Pages; also remove imported measurements from browser history.
    try{
      history.replaceState(history.state,'',location.pathname+location.search);
    }catch{
      // On browsers without History API permissions, a failed import stays visible for manual cleanup.
    }
  }
  function importBridgePayload(item){
    const date=item.date;
    const key='fitness-planner-'+date;
    const oldRaw=read(key,{});
    const old=oldRaw&&typeof oldRaw==='object'&&!Array.isArray(oldRaw)?oldRaw:{};
    const savedWeights=read('fitness-weights',[]);
    const oldWeights=Array.isArray(savedWeights)?savedWeights:[];
    const existingWeight=oldWeights.find(w=>w&&w.date===date&&Number.isFinite(w.value));
    const sameSteps=item.steps===undefined||Number(old.steps)===item.steps;
    const sameWeight=item.weight===undefined||(existingWeight&&existingWeight.value===item.weight);
    if(sameSteps&&sameWeight){
      status('#forgeSyncStatus','Diese Messwerte sind bereits für '+date+' gespeichert. Kein doppelter Import.');
      return;
    }
    const currentParts=[];
    if(item.steps!==undefined)currentParts.push(item.steps.toLocaleString('de-DE')+' Schritte');
    if(item.weight!==undefined)currentParts.push(german(item.weight)+' kg');
    const previous=(item.steps!==undefined&&old.steps!==undefined)||(item.weight!==undefined&&!!existingWeight);
    const prompt='FORGE-Übernahme aus Kurzbefehle für '+date+': '+currentParts.join(' und ')+'.\n'
      +(previous?'Achtung: Bereits gespeicherte Messungen für diesen Tag werden ersetzt.':'Neue Tageswerte hinzufügen.')
      +'\nNur in diesem Browser speichern?';
    if(!confirm(prompt)){
      status('#forgeSyncStatus','Import abgebrochen. Deine Daten wurden nicht verändert.');
      return;
    }
    // Rollback is attempted if local storage unexpectedly fails during multi-field save.
    const changes=[];
    if(item.steps!==undefined){
      changes.push([key,localStorage.getItem(key),JSON.stringify({...old,steps:item.steps,time:old.time??30,pace:old.pace??6.2,mode:old.mode??'normal'})]);
    }
    if(item.weight!==undefined){
      const merged=new Map(oldWeights.filter(w=>w&&typeof w.date==='string'&&Number.isFinite(w.value)).map(w=>[w.date,w.value]));
      merged.set(date,item.weight);
      const clean=[...merged].sort(([a],[b])=>a.localeCompare(b)).map(([date,value])=>({date,value}));
      changes.push(['fitness-weights',localStorage.getItem('fitness-weights'),JSON.stringify(clean)]);
    }
    const meta={date,at:new Date().toISOString(),source:'Apple Kurzbefehle'};
    if(item.steps!==undefined)meta.steps=item.steps;
    if(item.weight!==undefined)meta.weight=item.weight;
    changes.push([LOCAL_KEY,localStorage.getItem(LOCAL_KEY),JSON.stringify(meta)]);
    try{
      for(const [k,,v] of changes)localStorage.setItem(k,v);
    }catch{
      for(const [k,previous] of changes){
        try{if(previous===null)localStorage.removeItem(k);else localStorage.setItem(k,previous);}catch{}
      }
      status('#forgeSyncStatus','Speichern nicht möglich. Dein Browser-Speicher ist womöglich voll. Bitte Daten sichern.',true);
      return;
    }
    status('#forgeSyncStatus','Übernahme erfolgreich. FORGE aktualisiert die Tages- und Gewichtsübersicht.');
    displayLastSync();
    location.reload();
  }
  function handleIncoming(){
    const hash=location.hash||'';
    if(!hash.startsWith('#forge-sync?'))return;
    // Show the corresponding setup/status area so incoming links are understandable.
    const trainingTab=document.querySelector('.tab[data-view="training"]');
    if(trainingTab)trainingTab.click();
    cleanHash();
    try{
      const item=parseBridgeHash(hash);
      if(item)importBridgePayload(item);
    }catch(error){
      status('#forgeSyncStatus','Kurzbefehle-Link ungültig: '+error.message,true);
    }
  }

  $('#forgeCopyHealthLink').addEventListener('click',async()=>{
    const template=BASE_URL+'#forge-sync?date=DATUM&steps=SCHRITTE';
    try{
      if(!navigator.clipboard?.writeText)throw new Error('not available');
      await navigator.clipboard.writeText(template);
      status('#forgeSyncStatus','Link-Vorlage kopiert. Ersetze DATUM und SCHRITTE mit Kurzbefehle-Variablen. Optional kannst du &weight=GEWICHT ergänzen.');
    }catch{
      status('#forgeSyncStatus','Kopieren nicht möglich. Verwende diese Vorlage: '+template,true);
    }
  });
  displayLastSync();
  handleIncoming();
  window.addEventListener('hashchange',handleIncoming);

  function dateStart(time){
    if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time||''))throw new Error('Bitte gültige Erinnerungszeiten eintragen.');
    const now=new Date();
    const start=new Date(now.getFullYear(),now.getMonth(),now.getDate(),Number(time.slice(0,2)),Number(time.slice(3)),0);
    if(start.getTime()<=now.getTime())start.setDate(start.getDate()+1);
    return localDate(start).replace(/-/g,'')+'T'+time.replace(':','')+'00';
  }
  function escapeIcs(value){
    return value.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
  }
  function calendarEntry(id,name,time,description){
    const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    return [
      'BEGIN:VEVENT','UID:forge-'+id+'@fitness-tracker',
      'DTSTAMP:'+stamp,'DTSTART:'+dateStart(time),
      'DURATION:PT10M','RRULE:FREQ=DAILY',
      'SUMMARY:'+escapeIcs(name),'DESCRIPTION:'+escapeIcs(description),
      'BEGIN:VALARM','ACTION:DISPLAY','TRIGGER:PT0M',
      'DESCRIPTION:'+escapeIcs(name),'END:VALARM','END:VEVENT'
    ].join('\r\n');
  }
  $('#forgeExportCalendar').addEventListener('click',()=>{
    try{
      const settings=[
        ['forgeCalendarWeightOn','forgeCalendarWeightTime','wiegen','FORGE – Gewicht erfassen','Wiegen und in FORGE Quick Log eintragen.'],
        ['forgeCalendarCreatineOn','forgeCalendarCreatineTime','creatine','FORGE – Kreatin prüfen','Nur abhaken, wenn tatsächlich eingenommen.'],
        ['forgeCalendarStepsOn','forgeCalendarStepsTime','steps','FORGE – Schritte prüfen','Tagesziel anschauen und bei Bedarf Walking einplanen.']
      ];
      const events=settings.filter(x=>$('#'+x[0]).checked).map(x=>calendarEntry(x[2],x[3],$('#'+x[1]).value,x[4]));
      if(!events.length)throw new Error('Wähle mindestens eine Erinnerung aus.');
      const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//FORGE//Daily Fitness Reminders//DE','CALSCALE:GREGORIAN','METHOD:PUBLISH',...events,'END:VCALENDAR'].join('\r\n')+'\r\n';
      const blob=new Blob([ics],{type:'text/calendar;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');a.href=url;a.download='FORGE-Erinnerungen.ics';a.click();
      setTimeout(()=>URL.revokeObjectURL(url),1200);
      status('#forgeCalendarStatus',events.length+' tägliche Kalendertermine vorbereitet. Öffne die .ics-Datei und bestätige den Import in deinen Kalender.');
    }catch(error){
      status('#forgeCalendarStatus','Erinnerungen konnten nicht erstellt werden: '+error.message,true);
    }
  });
})();