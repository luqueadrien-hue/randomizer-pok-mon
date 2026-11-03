/* Draft réseau des 6 Dresseurs — version initiale limitée à Écarlate/Violet. */
(function(){
'use strict';
const Core=window.TrainerDraftCore;
let state=null,editing=null,busy=false,solo=false,soloState=null;
const moveNames=new Map();
const $=id=>document.getElementById(id);
const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const currentSeat=()=>solo?1:!mpSession?0:mpSession.id===mpSeats[1]?1:mpSession.id===mpSeats[2]?2:0;
const active=()=>gameMode.value==='trainerdraft6';
const labelMove=slug=>moveNames.get(slug)||String(slug).replace(/-/g,' ');
const labelType=slug=>typeof TYPE_FR!=='undefined'&&TYPE_FR[slug]||slug;
const formatEV=ev=>Object.entries(ev||{}).map(([key,val])=>key+': '+val).join(' · ');
function selectedGame(){const dex=$('generation')?.value;const games={'9':'sv','8':'swsh','4':'bdsp'};if(!games[dex])throw Error('Choisis un Dex compatible dans « Dex / Génération » : Paldea (9), Galar (8) ou Sinnoh (4).');return games[dex];}
const gameLabel={sv:'Écarlate / Violet',swsh:'Épée / Bouclier',bdsp:'Diamant Étincelant / Perle Scintillante'};
function renderPcPlaceholder(){
 const grid=$('trainerDraftGrid');if(!grid)return;
 grid.classList.add('draftPcGrid');
 grid.innerHTML=Core.TD6_RANKS.slice().reverse().map((rank,i)=>'<section class="draftPcRow"><div class="draftPcRank"><span class="draftPcIcon">'+esc(rank.icon)+'</span><strong>Rang '+(rank.id===6?'6–7':rank.id)+'</strong><small>'+esc(rank.label)+'</small></div><div class="draftPcSlots">'+Array.from({length:3},(_,j)=>'<div class="pcSlot draftPcCell draftPcPlaceholder" aria-label="Case '+(i*3+j+1)+' en attente du tirage"><span class="slotNo">'+(i*3+j+1)+'</span><span class="draftPcLogo" aria-hidden="true">'+esc(rank.icon)+'</span><span class="slotName">'+Core.TD6_RANK_PRICES[rank.id]+' ₽</span></div>').join('')+'</div></section>').join('');
}
function render(){
 const panel=$('trainerDraftPanel');if(!panel)return;
 panel.style.display=active()?'block':'none';
 if(!active())return;
 $('roll').disabled=true;
 const seat=currentSeat(),host=!!mpSession&&mpSession.role==='host';
 const soloButton=$('trainerDraftSolo');if(soloButton){soloButton.style.display='';soloButton.disabled=busy;soloButton.textContent=solo?'↻ Recommencer l’essai solo':'🧪 Essayer en solo';}
 const start=$('trainerDraftStart');
 start.style.display=host&&!solo?'':'none';start.disabled=busy||!mpLobbyStarted||!seat;
 const status=$('trainerDraftStatus'),grid=$('trainerDraftGrid');
 if(!solo&&(!mpSession||!mpLobbyStarted||!mpSeats[1]||!mpSeats[2])){
  status.textContent='Deux joueurs attribués et un challenge réseau démarré sont nécessaires.';
  renderPcPlaceholder();$('trainerDraftEditor').innerHTML='';return;
 }
 if(solo)state=soloState;
 if(!state||state.version!==1){
  status.textContent='Choisis un Dex compatible, puis génère la boîte PC. Les rangs nécessitent des associations documentées.';
  renderPcPlaceholder();$('trainerDraftEditor').innerHTML='';$('trainerDraftTeams').innerHTML='';return;
 }
 const mine=state.choices?.[seat]?.entries||[],used=new Set(mine.map(x=>x.trainerIndex));
 const one=state.choices?.[1]?.entries?.length||0,two=state.choices?.[2]?.entries?.length||0;
 status.textContent=(gameLabel[state.game]||state.game)+' · Marché & Draft · 18 cases partagées · Budget : '+(state.budget||Core.TD6_START_BUDGET)+' ₽ par joueur · J1 : '+one+'/6 · J2 : '+two+'/6'+(seat?' · Tes manches : '+mine.length+'/6':'');
 const taken=new Map();for(const n of [1,2])for(const e of state.choices?.[n]?.entries||[])taken.set(e.trainerIndex+':'+e.offerIndex,n);
 grid.classList.add('draftPcGrid');
 grid.innerHTML=state.offers.map((group,i)=>{
  const rank=group.rank||Core.TD6_RANKS[5-i],unavailable=used.has(i),chosen=mine.find(x=>x.trainerIndex===i);
  return '<section class="draftPcRow"><div class="draftPcRank"><span class="draftPcIcon">'+esc(rank.icon)+'</span><strong>Rang '+(rank.id===6?'6–7':rank.id)+'</strong><small>'+esc(rank.label)+' · '+esc(group.trainer)+'</small></div><div class="draftPcSlots">'+group.pokemon.map((p,j)=>{
   const owner=taken.get(i+':'+j),selected=chosen?.offerIndex===j,locked=!!owner,price=Core.TD6_RANK_PRICES[rank.id];
   return '<button type="button" class="pcSlot draftPcCell'+(selected?' is-selected':'')+(locked?' is-locked':'')+'" data-draft-trainer="'+i+'" data-draft-offer="'+j+'" '+(locked||unavailable||!seat||mine.length>=6||busy?'disabled':'')+' aria-label="Rang '+rank.id+', case '+(j+1)+(locked?', déjà prise par J'+owner:'')+'"><span class="draftPcLogo">'+esc(rank.icon)+'</span><span class="draftPcQuestion">'+(locked?'🔒':'?')+'</span><small>'+(locked?'Prise par J'+owner:'Case '+(j+1))+'</small></button>';
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
 box.innerHTML='<div class="panel" style="margin:12px 0;padding:14px"><h3>Acheter et personnaliser '+esc(p.name)+' — '+esc(state.offers[editing.trainerIndex].trainer)+' · '+Core.TD6_RANK_PRICES[state.offers[editing.trainerIndex].rank.id]+' ₽</h3><p>Objet : '+esc(p.itemName)+' · Talent : '+esc(p.ability)+' · EV : '+esc(formatEV(p.ev))+' · IV : 31 partout (fixes)</p>'+
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
 if(!seat||!state||mine.length>=6||mine.some(c=>c.trainerIndex===trainerIndex)||[1,2].some(n=>(state.choices?.[n]?.entries||[]).some(e=>e.trainerIndex===trainerIndex&&e.offerIndex===offerIndex)))return;
 const price=Core.TD6_RANK_PRICES[state.offers[trainerIndex].rank.id];
 const spent=mine.reduce((sum,e)=>sum+(e.price||Core.TD6_RANK_PRICES[state.offers[e.trainerIndex]?.rank?.id]||0),0);
 if(spent+price>(state.budget||Core.TD6_START_BUDGET)){alert('Budget insuffisant pour ce rang.');return}
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
  const game=selectedGame();
  $('trainerDraftStatus').textContent='Vérification des Pokémon, des rangs et des capacités pour '+gameLabel[game]+'…';
  const eligible=await trainerMarketEligible(game,false);
  const ids=Core.td6Shuffle([...new Set(Core.TD6_LORE.map(x=>x.id))].filter(id=>eligible.ids.has(id)));
  const candidates=[];
  for(let offset=0;offset<ids.length;offset+=8){
   const group=await Promise.all(ids.slice(offset,offset+8).map(async id=>{
    try{
     const p=await getP(id);
     if(p.legendary||!p.abilities?.length)return null;
     const legalMoves=[...new Set((p.moves||[]).filter(m=>(m.version_group_details||[]).some(d=>d.version_group?.name===({sv:'scarlet-violet',swsh:'sword-shield',bdsp:'brilliant-diamond-and-shining-pearl'}[game])&&['level-up','machine','egg','tutor'].includes(d.move_learn_method?.name))).map(m=>m.name))].sort();
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
  if(candidates.length<18)throw Error('Moins de 18 Pokémon compatibles et documentés : le marché ne sera pas publié.');
  const ref=mpRoom(mpSession.room).child('trainerDraft6');
  const prior=(await ref.once('value')).val();
  if(prior&&((prior.choices?.[1]?.entries?.length||0)+(prior.choices?.[2]?.entries?.length||0))>0&&!confirm('Nouvelle partie : effacer les choix actuels des deux joueurs ?'))return;
  const next=Core.td6Create(candidates,prior,Math.random,game);
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
 const seat=currentSeat();if(!seat||(!solo&&!mpLobbyStarted))throw Error('Tu ne fais pas partie des joueurs de cette table.');
 if(!solo&&(!MPAUTH?.currentUser||MPAUTH.currentUser.uid!==mpSession?.id))throw Error('Session Firebase expirée.');
 const draft=state,form={moves:[...editing.moves],nature:editing.nature,tera:editing.tera};
 Core.td6AddChoice(draft,seat,editing.trainerIndex,editing.offerIndex,form);
 busy=true;renderEditor();
 try{
  if(solo){soloState.choices[seat]=Core.td6AddChoice(soloState,seat,editing.trainerIndex,editing.offerIndex,form);state=soloState;editing=null;render();return;}
  const ref=mpRoom(mpSession.room).child('trainerDraft6');
  const tx=await ref.transaction(current=>{
   try{
    if(!current||current.gameId!==draft.gameId)return;
    const next=Core.td6AddChoice(current,seat,editing.trainerIndex,editing.offerIndex,form);
    current.choices[seat]=next;return current;
   }catch(e){return}
  });
  if(!tx.committed)throw Error('Case déjà choisie, rang déjà utilisé ou partie modifiée.');
  state=tx.snapshot.val();editing=null;render();
 }finally{busy=false;renderEditor()}
}
function receive(value){if(solo)return;state=value||null;if(editing&&editing.gameId!==state?.gameId)editing=null;render()}
async function trySolo(){
 if(busy)return;
 const game=selectedGame();
 busy=true;solo=true;soloState=null;editing=null;render();
 try{
  const eligible=await trainerMarketEligible(game,false);
  const ids=Core.td6Shuffle([...new Set(Core.TD6_LORE.map(x=>x.id))].filter(id=>eligible.ids.has(id)));
  const candidates=[];
  for(let offset=0;offset<ids.length;offset+=8){
   const batch=await Promise.all(ids.slice(offset,offset+8).map(async id=>{
    try{const p=await getP(id);if(p.legendary||!p.abilities?.length)return null;
     const legalMoves=[...new Set((p.moves||[]).filter(m=>(m.version_group_details||[]).some(d=>d.version_group?.name===({sv:'scarlet-violet',swsh:'sword-shield',bdsp:'brilliant-diamond-and-shining-pearl'}[game])&&['level-up','machine','egg','tutor'].includes(d.move_learn_method?.name))).map(m=>m.name))].sort();
     if(legalMoves.length<4)return null;
     const ability=p.abilities.find(a=>!a.hidden)||p.abilities[0];
     const physical=(p.stats?.attack||0)>=(p.stats?.['special-attack']||0);
     const ev={hp:252,speed:4};ev[physical?'attack':'special-attack']=252;
     const item=Core.TD6_ITEMS[Math.floor(Math.random()*Core.TD6_ITEMS.length)];
     return {id,name:p.name,img:p.img||'',ability:ability.name,item:item[0],itemName:item[1],ev,iv:{hp:31,attack:31,defense:31,'special-attack':31,'special-defense':31,speed:31},legalMoves,initialMoves:Core.td6Shuffle(legalMoves).slice(0,4),nature:physical?'Rigide':'Modeste',tera:p.types[0]||'normal'};
    }catch(e){return null}
   }));candidates.push(...batch.filter(Boolean));
  }
  if(candidates.length<18)throw Error('Catalogue lore insuffisant pour constituer 18 propositions dans ce Dex.');
  soloState=Core.td6Create(candidates,null,Math.random,game);soloState.gameId='solo-'+Date.now();soloState.choices[1].gameId=soloState.gameId;soloState.choices[2].gameId=soloState.gameId;
  state=soloState;
 }catch(e){soloState=null;solo=false;throw e}
 finally{busy=false;render()}
}
window.TrainerDraft6={start,receive,render,trySolo};
})();
