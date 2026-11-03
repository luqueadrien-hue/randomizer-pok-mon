/* Marché & Draft des Dresseurs : deux joueurs, cinq tarifs et trente cases. */
(function(){'use strict';
const Core=window.TrainerDraftCore,$=id=>document.getElementById(id);
let state=null,editing=null,busy=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const active=()=>$('gameMode')?.value==='trainerdraft6';
const seat=()=>!mpSession?0:mpSession.id===mpSeats[1]?1:mpSession.id===mpSeats[2]?2:0;
const gameLabel={sv:'Écarlate / Violet',swsh:'Épée / Bouclier',bdsp:'Diamant Étincelant / Perle Scintillante'};
function selectedGame(){const dex=$('generation')?.value;const games={'9':'sv','8':'swsh','4':'bdsp'};if(!games[dex])throw Error('Choisis Paldea (9), Galar (8) ou Sinnoh (4) dans Dex / Génération.');return games[dex]}
function render(){
 const panel=$('trainerDraftPanel');if(!panel)return;panel.style.display=active()?'block':'none';if(!active())return;
 $('roll').disabled=true;
 const host=!!mpSession&&mpSession.role==='host',me=seat();
 const start=$('trainerDraftStart');start.style.display=host?'':'none';start.disabled=busy||!mpLobbyStarted||!me;
 const grid=$('trainerDraftGrid'),status=$('trainerDraftStatus');
 if(!state||state.version!==2){
  status.textContent='Configure le budget et le type de boîte, puis clique sur Générer. Deux joueurs et un salon lancé sont nécessaires.';
  grid.innerHTML='';$('trainerDraftEditor').innerHTML='';$('trainerDraftTeams').innerHTML='';return;
 }
 const mine=state.choices?.[me]?.entries||[];
 const spent=mine.reduce((s,e)=>s+e.price,0);
 status.textContent=gameLabel[state.game]+' · '+(state.boxMode==='shared'?'Boîte commune':'Boîtes individuelles')+' · Budget '+state.budget+' $ par joueur · Ton solde '+(state.budget-spent)+' $ · J1 '+(state.choices?.[1]?.entries?.length||0)+'/6 · J2 '+(state.choices?.[2]?.entries?.length||0)+'/6';
 const box=state.boxes?.[me||1]||[];
 grid.classList.add('draftPcGrid');
 grid.innerHTML=box.map((row,i)=>'<section class="draftPcRow"><div class="draftPcRank"><strong>'+esc(row.rank.icon)+' '+esc(row.rank.label)+'</strong><small>'+row.price+' $ par Pokémon</small></div><div class="draftPcSlots">'+row.pokemon.map((p,j)=>{
  const mineTaken=mine.some(e=>e.rowIndex===i&&e.offerIndex===j);
  const other=state.boxMode==='shared'&&(state.choices?.[me===1?2:1]?.entries||[]).some(e=>e.rowIndex===i&&e.offerIndex===j);
  const taken=mineTaken||other,disabled=!me||busy||taken||mine.length>=6||spent+row.price>state.budget;
  return '<button type="button" class="pcSlot draftPcCell'+(taken?' is-locked':'')+'" data-draft-row="'+i+'" data-draft-offer="'+j+'" '+(disabled?'disabled':'')+' aria-label="'+esc(p.name)+' : '+row.price+' dollars"><span class="slotNo">'+(i*6+j+1)+'</span>'+(p.img?'<img src="'+esc(p.img)+'" alt="" loading="lazy" style="height:55px;max-width:90%;object-fit:contain">':'<span class="draftPcLogo">'+esc(row.rank.icon)+'</span>')+'<span class="slotName">'+esc(p.name)+'</span><small>'+esc(p.lore?.trainer||'Dresseur inconnu')+(taken?' · Acheté':'')+'</small></button>';
 }).join('')+'</div></section>').join('');
 grid.querySelectorAll('[data-draft-row]').forEach(b=>b.onclick=()=>openEditor(+b.dataset.draftRow,+b.dataset.draftOffer));
 $('trainerDraftTeams').innerHTML=[1,2].map(n=>{const entries=state.choices?.[n]?.entries||[],spent=entries.reduce((s,e)=>s+e.price,0);return '<p><strong>Joueur '+n+'</strong> · '+entries.length+'/6 · '+(state.budget-spent)+' $ restants : '+(entries.map(e=>esc(state.boxes[n][e.rowIndex].pokemon[e.offerIndex].name)).join(', ')||'Aucun achat')+'</p>'}).join('');
 renderEditor();
}
function openEditor(rowIndex,offerIndex){
 const me=seat(),row=state?.boxes?.[me]?.[rowIndex],p=row?.pokemon?.[offerIndex];if(!p)return;
 const entries=state.choices?.[me]?.entries||[],other=state.choices?.[me===1?2:1]?.entries||[];
 if(entries.length>=6||entries.some(e=>e.rowIndex===rowIndex&&e.offerIndex===offerIndex)||(state.boxMode==='shared'&&other.some(e=>e.rowIndex===rowIndex&&e.offerIndex===offerIndex)))return;
 if(entries.reduce((s,e)=>s+e.price,0)+row.price>state.budget)return;
 editing={gameId:state.gameId,rowIndex,offerIndex,moves:[...p.initialMoves],nature:p.nature,tera:p.tera};renderEditor();
}
function renderEditor(){
 const box=$('trainerDraftEditor');if(!editing||editing.gameId!==state?.gameId){box.innerHTML='';return}
 const row=state.boxes[seat()][editing.rowIndex],p=row.pokemon[editing.offerIndex];
 box.innerHTML='<div class="panel"><h3>'+esc(p.name)+' — '+esc(p.lore?.trainer)+' · '+row.price+' $</h3><p>'+esc(p.lore?.source||'')+'</p><div class="controls">'+editing.moves.map((m,i)=>'<label>Capacité '+(i+1)+'<select data-move="'+i+'">'+p.legalMoves.map(x=>'<option value="'+esc(x)+'" '+(m===x?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select></label>').join('')+'<label>Nature<select id="draftNature">'+Core.TD6_NATURES.map(n=>'<option '+(n===editing.nature?'selected':'')+'>'+esc(n)+'</option>').join('')+'</select></label><label>Type Téra<select id="draftTera">'+Core.TD6_TYPES.map(n=>'<option '+(n===editing.tera?'selected':'')+'>'+esc(n)+'</option>').join('')+'</select></label></div><button id="draftBuy" type="button">Acheter</button><button id="draftCancel" type="button">Annuler</button></div>';
 box.querySelectorAll('[data-move]').forEach(el=>el.onchange=()=>editing.moves[+el.dataset.move]=el.value);
 $('draftNature').onchange=e=>editing.nature=e.target.value;$('draftTera').onchange=e=>editing.tera=e.target.value;
 $('draftBuy').onclick=()=>choose().catch(e=>{alert(e.message);console.error(e)});
 $('draftCancel').onclick=()=>{editing=null;renderEditor()};
}
async function start(){
 if(busy)return;if(!active())throw Error('Sélectionne Marché & Draft.');
 if(!mpSession||!MPAUTH?.currentUser||mpSession.id!==MPAUTH.currentUser.uid)throw Error('Session Firebase invalide.');
 busy=true;render();
 try{
  const room=(await mpRoom(mpSession.room).once('value')).val()||{};
  if(room.ownerUid!==mpSession.id)throw Error('Seul l’hôte peut générer.');
  if(!room.started||!room.seats?.[1]||!room.seats?.[2]||room.seats[1]===room.seats[2])throw Error('Deux joueurs attribués sont nécessaires.');
  const game=selectedGame(),budget=Number($('trainerDraftBudget').value),boxMode=$('trainerDraftBoxMode').value;
  if(!Number.isInteger(budget)||budget<1||budget>100000)throw Error('Budget entre 1 et 100 000 $ requis.');
  $('trainerDraftStatus').textContent='Chargement des associations de dresseurs et Pokémon compatibles…';
  const eligible=await trainerMarketEligible(game,false);
  const ids=Core.td6Shuffle([...new Set(Core.TD6_LORE.map(x=>x.id))].filter(id=>eligible.ids.has(id)));
  const candidates=[];
  for(let offset=0;offset<ids.length;offset+=8){
   const group=await Promise.all(ids.slice(offset,offset+8).map(async id=>{
    try{
     const p=await getP(id);if(p.legendary||!p.abilities?.length)return null;
     const version={sv:'scarlet-violet',swsh:'sword-shield',bdsp:'brilliant-diamond-and-shining-pearl'}[game];
     const legalMoves=[...new Set((p.moves||[]).filter(m=>(m.version_group_details||[]).some(d=>d.version_group?.name===version&&['level-up','machine','egg','tutor'].includes(d.move_learn_method?.name))).map(m=>m.name))];
     if(legalMoves.length<4)return null;
     const physical=(p.stats?.attack||0)>=(p.stats?.['special-attack']||0),item=Core.TD6_ITEMS[Math.floor(Math.random()*Core.TD6_ITEMS.length)];
     const ev={hp:252,speed:4};ev[physical?'attack':'special-attack']=252;
     return {id,name:p.name,img:p.img||'',ability:p.abilities.find(a=>!a.hidden)?.name||p.abilities[0].name,item:item[0],itemName:item[1],ev,iv:{hp:31,attack:31,defense:31,'special-attack':31,'special-defense':31,speed:31},legalMoves,initialMoves:Core.td6Shuffle(legalMoves).slice(0,4),nature:physical?'Rigide':'Modeste',tera:p.types[0]||'normal'};
    }catch(e){console.warn('Candidat écarté',id,e);return null}
   }));candidates.push(...group.filter(Boolean));
  }
  const ref=mpRoom(mpSession.room).child('trainerDraft6'),prior=(await ref.once('value')).val();
  if(prior&&((prior.choices?.[1]?.entries?.length||0)+(prior.choices?.[2]?.entries?.length||0))>0&&!confirm('Effacer les achats actuels des deux joueurs ?'))return;
  const next=Core.td6Create(candidates,prior,Math.random,game,budget,boxMode);
  next.gameId=mpId()+Date.now();next.choices[1].gameId=next.gameId;next.choices[2].gameId=next.gameId;
  const tx=await ref.transaction(current=>{if((current?.gameId||null)!==(prior?.gameId||null)||(current?.created||null)!==(prior?.created||null))return;return next});
  if(!tx.committed)throw Error('Partie modifiée pendant la génération.');
  state=tx.snapshot.val();editing=null;render();
 }finally{busy=false;render()}
}
async function choose(){
 if(busy||!editing||!state)return;
 const me=seat();if(!me||!mpLobbyStarted||MPAUTH?.currentUser?.uid!==mpSession?.id)throw Error('Session réseau non autorisée.');
 const draft=state,form={moves:[...editing.moves],nature:editing.nature,tera:editing.tera};
 Core.td6AddChoice(draft,me,editing.rowIndex,editing.offerIndex,form);
 busy=true;
 try{
  const ref=mpRoom(mpSession.room).child('trainerDraft6');
  const tx=await ref.transaction(current=>{try{if(current?.gameId!==draft.gameId)return;current.choices[me]=Core.td6AddChoice(current,me,editing.rowIndex,editing.offerIndex,form);return current}catch(e){return}});
  if(!tx.committed)throw Error('Achat refusé : case déjà prise, budget insuffisant ou partie modifiée.');
  state=tx.snapshot.val();editing=null;render();
 }finally{busy=false;render()}
}
function receive(value){state=value||null;if(editing&&editing.gameId!==state?.gameId)editing=null;render()}
window.TrainerDraft6={start,receive,render};
})();
