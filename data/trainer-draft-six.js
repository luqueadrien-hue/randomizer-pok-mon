/* Draft réseau des 6 Dresseurs — version initiale limitée à Écarlate/Violet. */
(function(){
'use strict';
const Core=window.TrainerDraftCore;
let state=null,editing=null,busy=false;
const moveNames=new Map();
const $=id=>document.getElementById(id);
const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const currentSeat=()=>!mpSession?0:mpSession.id===mpSeats[1]?1:mpSession.id===mpSeats[2]?2:0;
const active=()=>gameMode.value==='trainerdraft6';
const labelMove=slug=>moveNames.get(slug)||String(slug).replace(/-/g,' ');
const labelType=slug=>typeof TYPE_FR!=='undefined'&&TYPE_FR[slug]||slug;
const formatEV=ev=>Object.entries(ev||{}).map(([key,val])=>key+': '+val).join(' · ');
function render(){
 const panel=$('trainerDraftPanel');if(!panel)return;
 panel.style.display=active()?'block':'none';
 if(!active())return;
 $('roll').disabled=true;
 const seat=currentSeat(),host=!!mpSession&&mpSession.role==='host';
 const start=$('trainerDraftStart');
 start.style.display=host?'':'none';start.disabled=busy||!mpLobbyStarted||!seat;
 const status=$('trainerDraftStatus'),grid=$('trainerDraftGrid');
 if(!mpSession||!mpLobbyStarted||!mpSeats[1]||!mpSeats[2]){
  status.textContent='Deux joueurs attribués et un challenge réseau démarré sont nécessaires.';
  grid.innerHTML='';$('trainerDraftEditor').innerHTML='';return;
 }
 if(!state||state.version!==1){
  status.textContent='En attente du tirage commun par l’hôte. Jeu actuellement validé : Écarlate/Violet (Pokédex de Paldea).';
  grid.innerHTML='';$('trainerDraftEditor').innerHTML='';return;
 }
 const mine=state.choices?.[seat]?.entries||[],used=new Set(mine.map(x=>x.trainerIndex));
 const one=state.choices?.[1]?.entries?.length||0,two=state.choices?.[2]?.entries?.length||0;
 status.textContent='Écarlate/Violet · 6 dresseurs · 18 Pokémon partagés · J1 : '+one+'/6 · J2 : '+two+'/6'+(seat?' · Tes manches : '+mine.length+'/6':'');
 grid.innerHTML=state.offers.map((group,i)=>{
  const unavailable=used.has(i),chosen=mine.find(x=>x.trainerIndex===i);
  return '<section class="draftBoxGroup"><h3 class="draftBoxTrainer">'+(i+1)+'. '+esc(group.trainer)+(unavailable?' — déjà utilisé':'')+'</h3><div class="draftBoxOffers">'+group.pokemon.map((p,j)=>{
   const selected=chosen?.offerIndex===j;
   return '<div class="draftBoxOffer'+(selected?' is-selected':'')+'"><span class="draftBoxSlot">'+(j+1)+'</span><img alt="" src="'+esc(p.img||'')+'"><strong>'+esc(p.name)+'</strong><small>Talent : '+esc(p.ability)+' · '+esc(p.itemName)+'</small><small>EV : '+esc(formatEV(p.ev))+' · IV : 31 partout</small><button type="button" data-draft-trainer="'+i+'" data-draft-offer="'+j+'" '+(unavailable||!seat||mine.length>=6||busy?'disabled':'')+'>'+(selected?'Choisi':'Personnaliser / choisir')+'</button></div>';
  }).join('')+'</div></section>';
 }).join('');
 grid.querySelectorAll('[data-draft-trainer]').forEach(b=>b.addEventListener('click',()=>openEditor(Number(b.dataset.draftTrainer),Number(b.dataset.draftOffer))));
 const team=$('trainerDraftTeams');
 team.innerHTML=[1,2].map(n=>'<p><strong>Joueur '+n+'</strong> : '+((state.choices?.[n]?.entries||[]).map(c=>esc(state.offers[c.trainerIndex]?.pokemon[c.offerIndex]?.name||'?')+' ('+esc(state.offers[c.trainerIndex]?.trainer||'?')+')').join(', ')||'Aucun Pokémon')+'</p>').join('');
 renderEditor();
}
function renderEditor(){
 const box=$('trainerDraftEditor');if(!box)return;
 if(!editing||!state||editing.gameId!==state.gameId){box.innerHTML='';return}
 const p=state.offers?.[editing.trainerIndex]?.pokemon?.[editing.offerIndex];
 if(!p){box.innerHTML='';return}
 const moves=editing.moves;
 box.innerHTML='<div class="panel" style="margin:12px 0;padding:14px"><h3>Personnaliser '+esc(p.name)+' — '+esc(state.offers[editing.trainerIndex].trainer)+'</h3><p>Objet : '+esc(p.itemName)+' · Talent : '+esc(p.ability)+' · EV : '+esc(formatEV(p.ev))+' · IV : 31 partout (fixes)</p>'+
  '<div class="controls">'+moves.map((selected,i)=>'<label>Capacité '+(i+1)+'<select data-draft-move="'+i+'">'+p.legalMoves.map(slug=>'<option value="'+esc(slug)+'" '+(slug===selected?'selected':'')+'>'+esc(labelMove(slug))+'</option>').join('')+'</select></label>').join('')+
  '<label>Nature<select id="trainerDraftNature">'+Core.TD6_NATURES.map(n=>'<option '+(n===editing.nature?'selected':'')+'>'+esc(n)+'</option>').join('')+'</select></label>'+
  '<label>Type Téracristal<select id="trainerDraftTera">'+Core.TD6_TYPES.map(t=>'<option value="'+esc(t)+'" '+(t===editing.tera?'selected':'')+'>'+esc(labelType(t))+'</option>').join('')+'</select></label></div>'+
  '<div class="actions"><button id="trainerDraftConfirm" class="primary" type="button" '+(busy?'disabled':'')+'>Valider cette manche</button><button id="trainerDraftCancel" type="button">Annuler</button></div><small>Les capacités affichées sont celles recensées pour le groupe de versions Écarlate/Violet. Les traductions manquantes apparaissent provisoirement en anglais.</small></div>';
 box.querySelectorAll('[data-draft-move]').forEach(sel=>sel.onchange=()=>{editing.moves[Number(sel.dataset.draftMove)]=sel.value});
 $('trainerDraftNature').onchange=e=>{editing.nature=e.target.value};
 $('trainerDraftTera').onchange=e=>{editing.tera=e.target.value};
 $('trainerDraftConfirm').onclick=()=>choose().catch(e=>{alert('Choix refusé : '+e.message);console.error(e)});
 $('trainerDraftCancel').onclick=()=>{editing=null;renderEditor()};
}
function openEditor(trainerIndex,offerIndex){
 const seat=currentSeat(),mine=state?.choices?.[seat]?.entries||[];
 if(!seat||!state||mine.length>=6||mine.some(c=>c.trainerIndex===trainerIndex))return;
 const p=state.offers?.[trainerIndex]?.pokemon?.[offerIndex];if(!p)return;
 editing={gameId:state.gameId,trainerIndex,offerIndex,pokemonId:p.id,moves:[...p.initialMoves],nature:p.nature,tera:p.tera};
 renderEditor();
 translateSelected(p.initialMoves);
}
async function translateSelected(slugs){
 for(const slug of slugs){
  if(moveNames.has(slug))continue;
  try{
   const data=await apiJson('https://pokeapi.co/api/v2/move/'+encodeURIComponent(slug));
   moveNames.set(slug,(data.names||[]).find(x=>x.language?.name==='fr')?.name||labelMove(slug));
   if(editing)renderEditor();
  }catch(e){moveNames.set(slug,labelMove(slug))}
 }
}
async function start(){
 if(busy)return;
 if(!active())throw Error('Sélectionne le mode Draft des 6 Dresseurs.');
 if(!mpSession||!MPAUTH?.currentUser||mpSession.id!==MPAUTH.currentUser.uid)throw Error('Session Firebase invalide.');
 busy=true;render();
 try{
  const room=(await mpRoom(mpSession.room).once('value')).val()||{};
  if(room.ownerUid!==mpSession.id)throw Error('Seul l’hôte peut préparer le tirage.');
  if(!room.started||!room.seats?.[1]||!room.seats?.[2]||room.seats[1]===room.seats[2])throw Error('Il faut deux joueurs attribués.');
  if($('trainerDraftGame').value!=='sv')throw Error('Ce jeu n’a pas encore de catalogue de sets vérifié.');
  $('trainerDraftStatus').textContent='Vérification des Pokémon et capacités Écarlate/Violet…';
  const eligible=await trainerMarketEligible('sv',false);
  const ids=Core.td6Shuffle(Core.TD6_POOL.filter(id=>eligible.ids.has(id)));
  const candidates=[];
  for(let offset=0;offset<ids.length&&candidates.length<18;offset+=8){
   const group=await Promise.all(ids.slice(offset,offset+8).map(async id=>{
    try{
     const p=await getP(id);
     if(!p.sv||p.legendary||!p.abilities?.length)return null;
     const legalMoves=[...new Set((p.moves||[]).filter(m=>(m.version_group_details||[]).some(d=>d.version_group?.name==='scarlet-violet'&&['level-up','machine','egg','tutor'].includes(d.move_learn_method?.name))).map(m=>m.name))].sort();
     if(legalMoves.length<4)return null;
     const ability=p.abilities.find(a=>!a.hidden)||p.abilities[0];
     const physical=(p.stats?.attack||0)>=(p.stats?.['special-attack']||0);
     const ev={hp:252,speed:4};ev[physical?'attack':'special-attack']=252;
     const item=Core.TD6_ITEMS[Math.floor(Math.random()*Core.TD6_ITEMS.length)];
     return {id,name:p.name,img:p.img||'',ability:ability.name,item:item[0],itemName:item[1],ev,iv:{hp:31,attack:31,defense:31,'special-attack':31,'special-defense':31,speed:31},legalMoves,initialMoves:Core.td6Shuffle(legalMoves).slice(0,4),nature:physical?'Rigide':'Modeste',tera:p.types[0]||'normal'};
    }catch(e){console.warn('Pokémon écarté du draft :',id,e.message);return null}
   }));
   candidates.push(...group.filter(Boolean));
  }
  if(candidates.length<18)throw Error('Moins de 18 sets vérifiés : le draft ne sera pas publié.');
  const ref=mpRoom(mpSession.room).child('trainerDraft6');
  const prior=(await ref.once('value')).val();
  if(prior&&((prior.choices?.[1]?.entries?.length||0)+(prior.choices?.[2]?.entries?.length||0))>0&&!confirm('Nouvelle partie : effacer les choix actuels des deux joueurs ?'))return;
  const next=Core.td6Create(candidates,prior);
  next.gameId=mpId()+Date.now();
  next.choices[1].gameId=next.gameId;next.choices[2].gameId=next.gameId;
  const tx=await ref.transaction(current=>{
   if((current?.gameId||null)!==(prior?.gameId||null)||(current?.created||null)!==(prior?.created||null))return;
   return next;
  });
  if(!tx.committed)throw Error('La partie a changé pendant le tirage : recommence.');
  editing=null;state=tx.snapshot.val();render();
 }finally{busy=false;render()}
}
async function choose(){
 if(busy||!editing||!state||!active())return;
 const seat=currentSeat();if(!seat||!mpLobbyStarted)throw Error('Tu ne fais pas partie des joueurs de cette table.');
 if(!MPAUTH?.currentUser||MPAUTH.currentUser.uid!==mpSession?.id)throw Error('Session Firebase expirée.');
 const draft=state,form={moves:[...editing.moves],nature:editing.nature,tera:editing.tera};
 Core.td6AddChoice(draft,seat,editing.trainerIndex,editing.offerIndex,form);
 busy=true;renderEditor();
 try{
  const ref=mpRoom(mpSession.room).child('trainerDraft6/choices/'+seat);
  const tx=await ref.transaction(current=>{
   try{
    const local={...draft,choices:{...draft.choices,[seat]:current}};
    return Core.td6AddChoice(local,seat,editing.trainerIndex,editing.offerIndex,form);
   }catch(e){return}
  });
  if(!tx.committed)throw Error('Choix déjà effectué, manche terminée ou nouvelle partie en cours.');
  state.choices[seat]=tx.snapshot.val();editing=null;render();
 }finally{busy=false;renderEditor()}
}
function receive(value){state=value||null;if(editing&&editing.gameId!==state?.gameId)editing=null;render()}
window.TrainerDraft6={start,receive,render};
})();
