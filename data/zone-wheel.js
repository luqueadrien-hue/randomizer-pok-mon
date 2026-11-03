(function(){'use strict';
const ZONES=[
...['Zone Sud n° 1','Zone Sud n° 2','Zone Sud n° 3','Zone Sud n° 4','Zone Sud n° 5','Zone Sud n° 6','Zone Est n° 1','Zone Est n° 2','Zone Est n° 3','Zone Ouest n° 1','Zone Ouest n° 2','Zone Ouest n° 3','Zone Nord n° 1','Zone Nord n° 2','Zone Nord n° 3','Lac Asrol','Désert Rôtissable','Mont Nappé','Forêt Toastée','Mer de Paldea (Nord)','Mer de Paldea (Sud)','Mer de Paldea (Est)','Mer de Paldea (Ouest)','Cratère de Paldea (Zone Zéro)'].map(name=>({region:'Paldea',name})),
...['Route de Septentria','Jardin des Pommes','Bois Moussu','Mont Strueux','Gorge de la Corne','Grotte du Lac Cristallin','Lac Cristallin','Plaine des Glycines','Terre de la Liesse','Hall des Masques','Village de Jaderaude','Rizières de Septentria','Confluent des Rivières','Paradis des Pommes'].map(name=>({region:'Septentria',name})),
...['Zone Savane','Zone Côtière','Zone Canyon','Zone Polaire'].map(name=>({region:'Institut Myrtille',name}))
];
const $=id=>document.getElementById(id);
let state=null,unsub=null,roomKey=null,busy=false;
const active=()=>$('gameMode')?.value==='zonewheel';
const seat=()=>!mpSession?0:mpSession.id===mpSeats[1]?1:mpSession.id===mpSeats[2]?2:0;
const escape=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\x27':'&#39;'}[x]));
const title=z=>z.region+' — '+z.name;
function paint(){
 const panel=$('zoneWheelPanel');if(!panel)return;panel.hidden=!active();if(!active())return;
 const can=!!mpSession&&mpLobbyStarted&&seat()!==0&&!!mpSeats[1]&&!!mpSeats[2];
 const spin=$('zoneWheelSpin');const previous=(state?.rounds?.length||0)-1;const waiting=previous>=0&&(!state?.captures?.[1]?.[previous]||!state?.captures?.[2]?.[previous]);spin.disabled=busy||!can||waiting||(state?.rounds?.length||0)>=6;
 const rounds=state?.rounds||[];
 const captures=state?.captures||{};
 const captureBox=$('zoneWheelCaptures');if(captureBox){captureBox.innerHTML=rounds.map((z,i)=>'<div class="card"><strong>Manche '+(i+1)+' — '+escape(title(z))+'</strong><div>J1 : '+escape(captures[1]?.[i]||'Non renseigné')+' · J2 : '+escape(captures[2]?.[i]||'Non renseigné')+'</div></div>').join('');}
 const captureInput=$('zoneWheelCaptureName'),captureButton=$('zoneWheelCaptureSave');if(captureInput&&captureButton){const idx=rounds.length-1;captureInput.disabled=captureButton.disabled=!can||idx<0||!!captures[seat()]?.[idx];captureInput.placeholder=idx<0?'Lance la roue d’abord':'Pokémon capturé dans la dernière zone';}
 $('zoneWheelStatus').textContent=!can?'Rejoins un salon à deux joueurs et lance le challenge pour activer la roue commune.':rounds.length>=6?'Six manches terminées : chaque joueur doit avoir capturé six Pokémon.':(waiting?'En attente des captures des deux joueurs pour passer à la manche suivante.':'Manche '+(rounds.length+1)+'/6 — un seul tirage partagé pour les deux joueurs.');
 $('zoneWheelResult').textContent=rounds.length?title(rounds[rounds.length-1]):'La roue attend son premier tirage';
 $('zoneWheelHistory').innerHTML=rounds.map((z,i)=>'<li>Manche '+(i+1)+' : '+escape(title(z))+'</li>').join('');
 $('zoneWheelDisc').style.transform='rotate('+((rounds.length*997)%360)+'deg)';
}
function watch(){
 if(!active()||!mpSession){if(unsub){unsub.off();unsub=null;roomKey=null}state=null;paint();return}
 const key=mpSession.room;
 if(roomKey===key)return;
 if(unsub)unsub.off();roomKey=key;
 unsub=mpRoom(key).child('zoneWheel');
 unsub.on('value',snap=>{state=snap.val();paint()},err=>{$('zoneWheelStatus').textContent='Erreur de synchronisation : '+err.message});
}
async function spin(){
 if(busy||!active()||!mpSession||!mpLobbyStarted||!seat())return;
 busy=true;paint();
 try{
  const ref=mpRoom(mpSession.room).child('zoneWheel');
  const room=(await mpRoom(mpSession.room).once('value')).val();
  if(!room?.started||!room?.seats?.[1]||!room?.seats?.[2])throw Error('Le challenge réseau à deux joueurs doit être lancé.');
  const random=new Uint32Array(1);crypto.getRandomValues(random);
  const tx=await ref.transaction(old=>{
   const rounds=Array.isArray(old?.rounds)?old.rounds:[];
   if(rounds.length>=6)return;
   const used=new Set(rounds.map(z=>z.region+'|'+z.name));
   const remaining=ZONES.filter(z=>!used.has(z.region+'|'+z.name));
   if(rounds.length){const last=rounds.length-1;if(!old?.captures?.[1]?.[last]||!old?.captures?.[2]?.[last])return;}
   const chosen=remaining[random[0]%remaining.length];
   return {version:2,rounds:[...rounds,chosen],captures:old?.captures||{},updated:Date.now()};
  });
  if(!tx.committed)throw Error('Six manches déjà jouées ou tirage simultané : actualise la roue.');
 }catch(e){$('zoneWheelStatus').textContent='❌ '+e.message}
 finally{busy=false;paint()}
}
async function saveCapture(){
 if(!mpSession||!mpLobbyStarted||!seat())return;
 const name=$('zoneWheelCaptureName')?.value?.trim();if(!name||name.length>80){alert('Indique le nom du Pokémon capturé (80 caractères maximum).');return}
 const ref=mpRoom(mpSession.room).child('zoneWheel');
 const tx=await ref.transaction(old=>{const i=(old?.rounds?.length||0)-1;if(i<0||old?.captures?.[seat()]?.[i])return;const captures=old.captures||{};captures[seat()]={...(captures[seat()]||{}),[i]:name};return {...old,captures}});
 if(!tx.committed)throw Error('Capture déjà renseignée ou manche indisponible.');
 $('zoneWheelCaptureName').value='';paint();
}
async function reset(){
 if(!mpSession||!mpLobbyStarted)return;
 const room=(await mpRoom(mpSession.room).once('value')).val();if(room?.ownerUid!==mpSession.id)return;
 if(!confirm('Réinitialiser les six manches de la roue pour les deux joueurs ?'))return;
 try{await mpRoom(mpSession.room).child('zoneWheel').remove()}catch(e){alert(e.message)}
}
function init(){
 $('zoneWheelSpin')?.addEventListener('click',spin);
 $('zoneWheelReset')?.addEventListener('click',reset);
 $('zoneWheelCaptureSave')?.addEventListener('click',()=>saveCapture().catch(e=>alert(e.message)));
 $('gameMode')?.addEventListener('change',()=>{watch();paint()});
 setInterval(()=>{if(active()){watch();paint()}else if(unsub)watch()},1800);
 paint();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.ZoneWheel={render:paint,zones:ZONES};
})();