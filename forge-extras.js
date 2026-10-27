/* FORGE companion module: local-first, no accounts or analytics. */
(()=>{
'use strict';
const $=selector=>document.querySelector(selector);
const $$=selector=>Array.from(document.querySelectorAll(selector));
const pad=n=>String(n).padStart(2,'0');
const day=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=day(new Date());
const get=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw);}catch{return fallback;}};
const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
const fmt=n=>Math.round(n).toLocaleString('de-DE');
const fmtDec=n=>Number(n).toLocaleString('de-DE',{maximumFractionDigits:2});
const dayValid=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s&&s<=today;
const workoutsKey='forge-workouts-v1', creatineKey='forge-creatine-'+today, prefsKey='forge-preferences-v1';
let prefs=get(prefsKey,{weight:true,creatine:true,steps:true});
if(!prefs||typeof prefs!=='object'||Array.isArray(prefs))prefs={weight:true,creatine:true,steps:true};
let workouts=get(workoutsKey,[]);
if(!Array.isArray(workouts))workouts=[];
workouts=workouts.filter(x=>x&&dayValid(x.date)&&typeof x.exercise==='string'&&Number.isFinite(x.weight)&&Number.isFinite(x.reps)&&Number.isFinite(x.sets));
const weights=()=>{const w=get('fitness-weights',[]);return Array.isArray(w)?w:[];};
const el=(tag,cls,content)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(content!==undefined)node.textContent=content;
 return node;
};
const show=(selector,message,error=false)=>{
 const node=$(selector);node.textContent=message;node.classList.toggle('error',error);
};
const currentSteps=()=>{
 const raw=$('#plannerSteps').value.trim(),num=Number(raw);
 return /^\d+$/.test(raw)&&Number.isSafeInteger(num)&&num>=0&&num<=50000?num:0;
};

// Quick Log: use existing source-of-truth fields and event handlers.
$('#forgeQuickSteps').value=String(currentSteps());
$('#forgeCreatine').checked=get(creatineKey,false)===true;
$('#forgeSaveSteps').addEventListener('click',()=>{
 const raw=$('#forgeQuickSteps').value.trim(),count=Number(raw);
 if(!/^\d+$/.test(raw)||!Number.isSafeInteger(count)||count<0||count>50000){
  show('#forgeQuickStatus','Bitte zwischen 0 und 50.000 tatsächlich gelaufene Schritte angeben.',true);return;
 }
 $('#plannerSteps').value=String(count);
 $('#plannerSteps').dispatchEvent(new Event('input',{bubbles:true}));
 show('#forgeQuickStatus',fmt(count)+' Schritte für heute gespeichert.');
 renderReminders();
});
$('#plannerSteps').addEventListener('input',()=>{
 if(document.activeElement!==$('#forgeQuickSteps'))$('#forgeQuickSteps').value=String(currentSteps());
 renderReminders();
});
$('#forgeSaveWeight').addEventListener('click',()=>{
 const raw=$('#forgeQuickWeight').value.trim().replace(',','.'),weight=Number(raw);
 if(!/^\d+(\.\d{1,2})?$/.test(raw)||!Number.isFinite(weight)||weight<50||weight>200){
  show('#forgeQuickStatus','Bitte ein Gewicht von 50 bis 200 kg eingeben.',true);return;
 }
 $('#weightDate').value=today;
 $('#weightValue').value=String(weight);
 $('#addWeight').click();
 show('#forgeQuickStatus',fmtDec(weight)+' kg im bisherigen Gewichtsverlauf gespeichert.');
 renderReminders();
});
$('#forgeCreatine').addEventListener('change',event=>{
 save(creatineKey,!!event.target.checked);
 show('#forgeQuickStatus',event.target.checked?'Kreatin für heute abgehakt.':'Kreatin-Markierung zurückgesetzt.');
 renderReminders();
});

// A true one-tap backup on the Today screen reuses the existing JSON export/import logic.
const quickBackupStatus=$('#forgeQuickBackupFeedback');
$('#forgeQuickExport').addEventListener('click',()=>{
 const exportButton=$('#exportData');
 if(!exportButton){quickBackupStatus.textContent='Datensicherung gerade nicht verfügbar.';return;}
 try{
   exportButton.click();
   const message=$('#backupFeedback').textContent.trim();
   quickBackupStatus.textContent=message
     ?message+' Prüfe in Safari die heruntergeladene Datei und bewahre sie in „Dateien“ sicher auf.'
     :'Backup angefordert. Prüfe in Safari deine Downloads und sichere die JSON-Datei.';
 }catch(error){
   quickBackupStatus.textContent='Der Download konnte nicht gestartet werden. Versuche es unter Fortschritt → Daten sichern.';
 }
});
$('#forgeQuickRestore').addEventListener('click',()=>{
 quickBackupStatus.textContent='Wähle deine FORGE-JSON-Datei. Bestehende Werte werden erst nach ausdrücklicher Bestätigung überschrieben.';
 $('#importData').click();
});
// The original restore control lives in another tab; expose validation errors on Today too.
const originalBackupStatus=$('#backupFeedback');
if(originalBackupStatus&&typeof MutationObserver!=='undefined'){
 new MutationObserver(()=>{
  const message=originalBackupStatus.textContent.trim();
  if(message&&message.startsWith('Import nicht möglich:'))quickBackupStatus.textContent=message;
 }).observe(originalBackupStatus,{childList:true,characterData:true,subtree:true});
}

// The keyboard should not compete with a fixed bottom navigation bar on an iPhone.
const canEdit=element=>element&&element.matches&&element.matches('input:not([type="checkbox"]):not([type="file"]), textarea, select');
document.addEventListener('focusin',event=>{
 if(canEdit(event.target))document.body.classList.add('forge-editing');
});
document.addEventListener('focusout',()=>{
 setTimeout(()=>{
  if(!canEdit(document.activeElement))document.body.classList.remove('forge-editing');
 },0);
});

// Walking Autopilot: conservative planning, not treadmill control.
let paceSuggestion=null;
function renderAutoPace(){
 const steps=currentSteps(),time=Number($('#plannerTime').value),rawStride=Number($('#stride').value);
 const stride=Number.isFinite(rawStride)&&rawStride>=.4&&rawStride<=1.2?rawStride:.76;
 const incline=Number($('#incline').value),mode=$('#plannerMode').value;
 const remaining=Math.max(0,10000-steps),btn=$('#forgeUseAuto'),tip=$('#forgeAutoText');
 btn.disabled=true;paceSuggestion=null;
 if(!Number.isFinite(time)||time<1||time>240){
  tip.textContent='Gib 1–240 Minuten verfügbare Zeit ein, um einen Vorschlag zu erhalten.';return;
 }
 if(remaining===0){tip.textContent='Dein Tagesziel ist erreicht. Du brauchst keine weitere Walking-Einheit.';return;}
 const cap=mode==='easy'?4.8:mode==='gym'?5.2:incline>=7?5.2:6.2;
 const required=remaining*stride/1000/(time/60);
 const pace=Math.min(cap,Math.ceil(Math.max(3,required)*10)/10);
 paceSuggestion=Number(pace.toFixed(1));btn.disabled=false;
 const possible=Math.floor(time*paceSuggestion*1000/(60*stride));
 if(required>cap){
  const extra=Math.ceil(remaining*stride*60/(cap*1000)-time);
  tip.textContent='Das Ziel würde ca. '+fmtDec(required)+' km/h verlangen – für die Empfehlung zu schnell. Besser: '+fmtDec(paceSuggestion)+' km/h und ungefähr '+extra+' Minuten zusätzlich einplanen. Weniger Schritte sind ebenfalls okay.';
 }else{
  tip.textContent='Empfehlung: '+fmtDec(paceSuggestion)+' km/h für '+time+' Minuten; damit sind ungefähr '+fmt(Math.min(remaining,possible))+' deiner '+fmt(remaining)+' fehlenden Schritte erreichbar.';
 }
 if(incline>=7)tip.textContent+=' Hohe Steigung: Tempo bei Bedarf reduzieren.';
}
['plannerSteps','plannerTime','stride','incline'].forEach(id=>$('#'+id).addEventListener('input',renderAutoPace));
$('#plannerMode').addEventListener('change',renderAutoPace);
$('#forgeUseAuto').addEventListener('click',()=>{
 if(paceSuggestion===null)return;
 $('#plannerPace').value=String(paceSuggestion).replace('.',',');
 $('#plannerPace').dispatchEvent(new Event('input',{bubbles:true}));
 renderAutoPace();
});
renderAutoPace();

// Training tracker with latest performance.
$('#forgeWorkoutDate').value=today;
function currentExercise(){
 return $('#forgeExercise').value==='custom'?$('#forgeCustomExercise').value.trim():$('#forgeExercise').value;
}
function displayPrevious(){
 const name=currentExercise();
 const history=workouts.filter(x=>x.exercise===name).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
 if(!history.length){$('#forgePrevious').textContent='Noch keine vorherige Leistung für diese Übung.';return;}
 const last=history[0];
 let text='Letztes Mal: '+last.sets+' × '+last.reps+' Wdh. mit '+fmtDec(last.weight)+' kg ('+last.date+').';
 if(last.reps>=10)text+=' Bei guter Technik ist eine kleine Steigerung eventuell sinnvoll.';
 $('#forgePrevious').textContent=text;
}
$('#forgeExercise').addEventListener('change',()=>{
 $('#forgeCustomExerciseWrap').style.display=$('#forgeExercise').value==='custom'?'block':'none';
 displayPrevious();
});
$('#forgeCustomExercise').addEventListener('input',displayPrevious);
$('#forgeSaveWorkout').addEventListener('click',()=>{
 const date=$('#forgeWorkoutDate').value,exercise=currentExercise(),sets=Number($('#forgeSets').value),reps=Number($('#forgeReps').value);
 const raw=$('#forgeWeight').value.trim().replace(',','.'),weight=Number(raw);
 if(!dayValid(date)||!exercise||exercise.length>70||!Number.isInteger(sets)||sets<1||sets>12||
 !Number.isInteger(reps)||reps<1||reps>100||!/^\d+(\.\d{1,2})?$/.test(raw)||!Number.isFinite(weight)||weight<0||weight>400){
  show('#forgeWorkoutFeedback','Bitte Datum, Übung, Sätze (1–12), Wiederholungen (1–100) und Gewicht (0–400 kg) prüfen.',true);
  return;
 }
 const item={id:Date.now()+Math.floor(Math.random()*1000),date,routine:$('#forgeWorkoutType').value,exercise,sets,reps,weight};
 workouts.push(item);
 if(!save(workoutsKey,workouts)){workouts.pop();show('#forgeWorkoutFeedback','Gerätespeicher voll oder nicht verfügbar.',true);return;}
 show('#forgeWorkoutFeedback','Übung gespeichert – beim nächsten Training wird deine Leistung verglichen.');
 renderWorkouts();
});
function renderWorkouts(){
 const zone=$('#forgeWorkoutEntries');zone.replaceChildren();
 const d=new Date(today+'T12:00:00');d.setDate(d.getDate()-6);const min=day(d);
 const count=new Set(workouts.filter(w=>w.date>=min&&w.date<=today).map(w=>w.date)).size;
 $('#forgeWeekSessions').textContent=count+' / 3';
 $('#forgeTotalSets').textContent=String(workouts.length);
 if(!workouts.length)zone.appendChild(el('div','forge-empty','Noch keine Übungen gespeichert.'));
 else [...workouts].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).slice(0,30).forEach(w=>{
  const row=el('div','forge-entry'),info=el('div'),name=el('strong',null,w.exercise);
  const sub=el('small',null,w.date+' · '+w.routine+' · '+w.sets+' × '+w.reps+' Wdh. · '+fmtDec(w.weight)+' kg');
  info.append(name,sub);
  const remove=el('button','forge-sm-btn','Löschen');remove.type='button';remove.setAttribute('aria-label','Trainingseintrag löschen');
  remove.addEventListener('click',()=>{
   if(!confirm('Diesen Trainingseintrag löschen?'))return;
   workouts=workouts.filter(x=>x.id!==w.id);save(workoutsKey,workouts);renderWorkouts();
  });
  row.append(info,remove);zone.appendChild(row);
 });
 displayPrevious();
}
renderWorkouts();

// In-app reminders intentionally run only on page open/focus or after entries.
function renderReminders(){
 const zone=$('#forgeReminderList');zone.replaceChildren();
 let count=0;
 const add=message=>{zone.appendChild(el('div','forge-reminder',message));count++;};
 if(prefs.weight!==false&&!weights().some(w=>w&&w.date===today))
  add('Gewicht heute noch nicht erfasst. Möglichst morgens unter vergleichbaren Bedingungen wiegen.');
 if(prefs.creatine!==false&&get(creatineKey,false)!==true)
  add('Kreatin heute noch nicht abgehakt.');
 if(prefs.steps!==false&&currentSteps()<10000)
  add('Noch '+fmt(10000-currentSteps())+' Schritte fehlen zum Tagesziel. Dein Walking-Planer kann sie aufteilen.');
 if(!count)zone.appendChild(el('div','forge-note','Alle ausgewählten Einträge sind für heute erledigt.'));
}
[['forgeRemindWeight','weight'],['forgeRemindCreatine','creatine'],['forgeRemindSteps','steps']].forEach(([id,key])=>{
 $('#'+id).checked=prefs[key]!==false;
 $('#'+id).addEventListener('change',event=>{
  prefs[key]=event.target.checked;save(prefsKey,prefs);renderReminders();
 });
});
renderReminders();

// CSV: manual bridge to Garmin/Apple Health exports; never ask for API secrets.
$('#forgeImportButton').addEventListener('click',()=>$('#forgeImportInput').click());
$('#forgeImportInput').addEventListener('change',async event=>{
 const file=event.target.files&&event.target.files[0];if(!file)return;
 try{
  if(file.size>2*1024*1024)throw Error('Datei größer als 2 MB.');
  const data=(await file.text()).replace(/^\uFEFF/,'').trim(),lines=data.split(/\r?\n/);
  if(lines.length<2||lines.length>2000)throw Error('Die CSV benötigt eine Kopfzeile und maximal 1.998 Datenzeilen.');
  const delimiter=lines[0].includes(';')?';':',';
  const fields=lines[0].split(delimiter).map(s=>s.trim().toLowerCase().replace(/^["']|["']$/g,''));
  const dateIx=fields.findIndex(s=>s==='date'||s==='datum');
  const stepIx=fields.findIndex(s=>s==='steps'||s==='schritte');
  const weightIx=fields.findIndex(s=>s==='weight'||s==='gewicht');
  if(dateIx<0||(stepIx<0&&weightIx<0))throw Error('Spalten date plus steps und/oder weight erforderlich.');
  const steps=new Map(),weight=new Map();
  let skipped=0;
  for(const line of lines.slice(1)){
   if(!line.trim())continue;
   const cells=line.split(delimiter).map(s=>s.trim().replace(/^["']|["']$/g,'')),date=cells[dateIx];
   if(!dayValid(date)){skipped++;continue;}
   let did=false;
   if(stepIx>=0&&cells[stepIx]!==undefined&&/^\d+$/.test(cells[stepIx])){
    const s=Number(cells[stepIx]);
    if(Number.isSafeInteger(s)&&s<=50000){steps.set(date,s);did=true;}
   }
   if(weightIx>=0&&cells[weightIx]){
    const n=Number(cells[weightIx].replace(',','.'));
    if(Number.isFinite(n)&&n>=50&&n<=200){weight.set(date,Math.round(n*100)/100);did=true;}
   }
   if(!did)skipped++;
  }
  if(!steps.size&&!weight.size)throw Error('Keine gültigen Messwerte in der Datei gefunden.');
  const previousWeights=weights();
  const conflict=[...steps.keys()].some(d=>localStorage.getItem('fitness-planner-'+d)!==null)
  ||[...weight.keys()].some(d=>previousWeights.some(w=>w&&w.date===d));
  if(!confirm(conflict?'Bestehende Tageswerte würden überschrieben. Import trotzdem durchführen?':'CSV-Daten lokal importieren?')){
   show('#forgeImportStatus','Import abgebrochen.');return;
  }
  // Validate fully, then apply. No network requests.
  if(weight.size){
   const newWeights=new Map(previousWeights.filter(x=>x&&typeof x.date==='string').map(x=>[x.date,x.value]));
   for(const [d,v] of weight)newWeights.set(d,v);
   save('fitness-weights',[...newWeights].map(([date,value])=>({date,value})).sort((a,b)=>a.date.localeCompare(b.date)));
  }
  for(const [date,value] of steps){
   const key='fitness-planner-'+date,stored=get(key,{});
   const last=stored&&typeof stored==='object'&&!Array.isArray(stored)?stored:{};
   save(key,{...last,steps:value,time:last.time??30,pace:last.pace??6.2,mode:last.mode??'normal'});
  }
  show('#forgeImportStatus','Importiert: '+steps.size+' Tage mit Schritten und '+weight.size+' Tage mit Gewicht.'+(skipped?' '+skipped+' ungültige Zeilen übersprungen.':''));
  window.location.reload();
 }catch(err){show('#forgeImportStatus','Import nicht möglich: '+err.message,true);}
 finally{event.target.value='';}
});

// Installable app: offline cache via a separate service worker.
let deferredInstall=null;
window.addEventListener('beforeinstallprompt',event=>{
 event.preventDefault();deferredInstall=event;$('#forgeInstallButton').hidden=false;
});
$('#forgeInstallButton').addEventListener('click',async()=>{
 if(!deferredInstall)return;
 const prompt=deferredInstall;deferredInstall=null;
 try{await prompt.prompt();}catch{}
 $('#forgeInstallButton').hidden=true;
});
window.addEventListener('appinstalled',()=>{
 $('#forgeInstallNote').textContent='FORGE wurde auf deinem Gerät installiert.';
});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
window.addEventListener('focus',()=>{renderReminders();renderAutoPace();});

// Gerätediagnose ohne Zugriff auf Fitnesswerte im Bericht.
$('#forgeDeviceCheck').addEventListener('click',async()=>{
 const target=$('#forgeDeviceResults'),button=$('#forgeDeviceCheck');
 button.disabled=true;target.replaceChildren();
 const add=(kind,title,detail)=>{
  const line=document.createElement('div');
  line.className='forge-reminder';
  line.style.borderColor=kind==='ok'?'#416846':kind==='warn'?'#756142':'#824647';
  const state=kind==='ok'?'✓':kind==='warn'?'!':'×';
  line.textContent=state+' '+title+' – '+detail;
  target.appendChild(line);
 };
 try{
  const token='forge-check-'+Date.now(),value='test-'+Math.random();
  try{
   localStorage.setItem(token,value);
   const correct=localStorage.getItem(token)===value;
   localStorage.removeItem(token);
   if(correct)add('ok','Lokaler Speicher','Schreiben und Lesen funktionieren.');
   else add('fail','Lokaler Speicher','Gespeicherte Werte konnten nicht korrekt gelesen werden.');
  }catch(e){add('fail','Lokaler Speicher','Kein verlässlicher Speicherzugriff. Private-Browsing-Einstellungen prüfen.');}
  if('serviceWorker' in navigator){
   try{
    const reg=await navigator.serviceWorker.getRegistration();
    if(reg&&reg.active)add('ok','Offline-Technik','Service Worker ist aktiv.');
    else add('warn','Offline-Technik','Noch nicht aktiv. FORGE online neu öffnen.');
   }catch(e){add('warn','Offline-Technik','Aktivierung konnte nicht geprüft werden.');}
  }else add('warn','Offline-Technik','Dieser Browser unterstützt hier keine Service Worker.');
  if('caches' in window){
   try{
    const base=new URL('./index.html',window.location.href);
    const cached=await caches.match(base.href);
    if(cached)add('ok','Offline-Startdatei','Im Browsercache vorhanden.');
    else add('warn','Offline-Startdatei','Noch nicht im Cache. Öffne FORGE online erneut.');
   }catch(e){add('warn','Offline-Startdatei','Cacheprüfung war nicht möglich.');}
  }else add('warn','Offline-Startdatei','Cache API nicht verfügbar.');
  const standalone=window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches;
  if(standalone||navigator.standalone===true)add('ok','App-Modus','FORGE läuft als eigenständige Web-App.');
  else add('warn','App-Modus','Aktuell im Browser geöffnet. Auf dem Home-Bildschirm installierbar.');
 }finally{
  button.disabled=false;
 }
});
})();