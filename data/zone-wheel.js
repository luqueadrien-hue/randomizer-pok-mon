(function(){'use strict';
const ZONES=[
...['Zone Sud n° 1','Zone Sud n° 2','Zone Sud n° 3','Zone Sud n° 4','Zone Sud n° 5','Zone Sud n° 6','Zone Est n° 1','Zone Est n° 2','Zone Est n° 3','Zone Ouest n° 1','Zone Ouest n° 2','Zone Ouest n° 3','Zone Nord n° 1','Zone Nord n° 2','Zone Nord n° 3','Lac Asrol','Désert Rôtissable','Mont Nappé','Forêt Toastée','Mer de Paldea (Nord)','Mer de Paldea (Sud)','Mer de Paldea (Est)','Mer de Paldea (Ouest)','Cratère de Paldea (Zone Zéro)'].map(name=>({region:'Paldea',name})),
...['Route de Septentria','Jardin des Pommes','Bois Moussu','Mont Strueux','Gorge de la Corne','Grotte du Lac Cristallin','Lac Cristallin','Plaine des Glycines','Terre de la Liesse','Hall des Masques','Village de Jaderaude','Rizières de Septentria','Confluent des Rivières','Paradis des Pommes'].map(name=>({region:'Septentria',name})),
...['Zone Savane','Zone Côtière','Zone Canyon','Zone Polaire'].map(name=>({region:'Institut Myrtille',name}))
];

// Zones regroupées par jeu Switch. Les intitulés sont des zones de capture,
// et non des garanties qu'une espèce particulière y est disponible.
const GAME_ZONES={
 sv:ZONES,
 swsh:[
 ...['Route 1','Route 2','Route 3','Route 4','Route 5','Route 6','Route 7','Route 8','Route 9','Route 10','Mine de Galar','Mine de Galar n° 2','Forêt de Sleepwood','Forêt de Lumirinth','Lac Ouragan','Prairie Entre-Ponts','Terres Sauvages — Plaine Verdoyante','Terres Sauvages — Lac Coupenotte','Terres Sauvages — Siège du Géant','Terres Sauvages — Miroir du Géant','Terres Sauvages — Coiffe du Géant'].map(name=>({region:'Galar',name})),
 ...['Plaine Salutation','Lande Boldair','Forêt Flexion','Plage de l’Épreuve','Mer Eau-Hisse','Mer Calméole','Îlot Calméole','Désert Potbottom'].map(name=>({region:'Isolarmure',name})),
 ...['Plaine Granfroy','Champ des Flocons','Cimetière Ancien','Lac Poké Ball','Pente Enneigée','Grotte Gronde-Mer','Mer Banquise','Temple Couronne','Plateau Beau-Gant'].map(name=>({region:'Couronneige',name}))
 ],
 bdsp:[
 ...['Route 201','Route 202','Route 203','Route 204','Route 205','Route 206','Route 207','Route 208','Route 209','Route 210','Route 211','Route 212','Route 213','Route 214','Route 215','Route 216','Route 217','Route 218','Route 219','Route 220','Route 221','Route 222','Route 224','Route 225','Route 226','Route 227','Route 228','Route 229','Route 230','Forêt Vestigion','Mont Couronné','Grand Marais','Île de Fer','Lac Vérité','Lac Courage','Lac Savoir'].map(name=>({region:'Sinnoh',name})),
 ...['Grotte Spacieuse','Grotte des Prairies','Grotte des Eaux Souterraines','Grotte Volcanique','Grotte Glaciale'].map(name=>({region:'Grands Souterrains',name}))
 ],
 pla:[
 ...['Plaine Obsidienne','Bocage Agité','Sentier Cer-Mont','Marais Bouchebée','Plateau Cer-Mont','Île Rosa Rugosa'].map(name=>({region:'Plaines Obsidiennes',name})),
 ...['Marais Carmin','Ruines Bonvivre','Marais Bouchebée','Tourbière Rouge','Plaine d’Or'].map(name=>({region:'Marais Carmin',name})),
 ...['Côte Lazuli','Plage Ginkgo','Cap du Voile','Baie Sérénité','Passage Côtier'].map(name=>({region:'Côte Lazuli',name})),
 ...['Contrefort Couronné','Grotte des Égarés','Source Féerique','Sentier des Pèlerins'].map(name=>({region:'Contrefort Couronné',name})),
 ...['Terres Immaculées','Pente de l’Avalanche','Lac Savoir','Temple Frimapic'].map(name=>({region:'Terres Immaculées',name}))
 ],
 letsgo:[
 ...['Route 1','Route 2','Route 3','Route 4','Route 5','Route 6','Route 7','Route 8','Route 9','Route 10','Route 11','Route 12','Route 13','Route 14','Route 15','Route 16','Route 17','Route 18','Route 19','Route 20','Route 21','Route 22','Route 23','Route 24','Route 25','Forêt de Jade','Mont Sélénite','Grotte','Îles Écume','Grotte Azurée','Route Victoire','Centrale'].map(name=>({region:'Kanto',name}))
 ],
 za:Array.from({length:20},(_,i)=>({region:'Illumis',name:'Zone sauvage '+(i+1)}))
};
const GAME_LABELS={sv:'Écarlate / Violet + DLC',swsh:'Épée / Bouclier + DLC',bdsp:'Diamant Étincelant / Perle Scintillante',pla:'Légendes Pokémon : Arceus',letsgo:'Let’s Go Pikachu / Évoli',za:'Légendes Pokémon : Z-A'};
const selectedGame=()=>$('zoneWheelGame')?.value||'sv';
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
 const rounds=state?.rounds||[];const game=state?.game||selectedGame();const gameInput=$('zoneWheelGame');if(gameInput){gameInput.disabled=!!state?.rounds?.length;gameInput.value=game;}
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
   const game=old?.game||selectedGame();const remaining=(GAME_ZONES[game]||GAME_ZONES.sv).filter(z=>!used.has(z.region+'|'+z.name));
   if(rounds.length){const last=rounds.length-1;if(!old?.captures?.[1]?.[last]||!old?.captures?.[2]?.[last])return;}
   if(!remaining.length)return;const chosen=remaining[random[0]%remaining.length];
   return {version:3,game,rounds:[...rounds,chosen],captures:old?.captures||{},updated:Date.now()};
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
function init(){const panel=$('zoneWheelPanel');if(panel&&!$('zoneWheelGame')){const label=document.createElement('label');label.textContent='Jeu Switch / zones de capture ';const select=document.createElement('select');select.id='zoneWheelGame';for(const [id,name] of Object.entries(GAME_LABELS)){const option=document.createElement('option');option.value=id;option.textContent=name;select.appendChild(option)}label.appendChild(select);panel.insertBefore(label,$('zoneWheelDisc'));select.addEventListener('change',paint)}
 $('zoneWheelSpin')?.addEventListener('click',spin);
 $('zoneWheelReset')?.addEventListener('click',reset);
 $('zoneWheelCaptureSave')?.addEventListener('click',()=>saveCapture().catch(e=>alert(e.message)));
 $('gameMode')?.addEventListener('change',()=>{watch();paint()});
 setInterval(()=>{if(active()){watch();paint()}else if(unsub)watch()},1800);
 paint();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.ZoneWheel={render:paint,zones:ZONES,gameZones:GAME_ZONES};
})();