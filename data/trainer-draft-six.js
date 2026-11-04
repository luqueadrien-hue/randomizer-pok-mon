/* Marché & Draft des Dresseurs : deux joueurs, cinq tarifs et trente cases. */
(function(){'use strict';
const Core=window.TrainerDraftCore,$=id=>document.getElementById(id);
let state=null,editing=null,busy=false,localMode=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const active=()=>$('gameMode')?.value==='trainerdraft6';
const seat=()=>localMode||!mpSession||!mpLobbyStarted?1:mpSession.id===mpSeats[1]?1:mpSession.id===mpSeats[2]?2:0;
const gameLabel={sv:'Écarlate / Violet',swsh:'Épée / Bouclier',bdsp:'Diamant Étincelant / Perle Scintillante'};
function selectedGame(){const dex=$('generation')?.value;const games={'9':'sv','8':'swsh','4':'bdsp'};if(dex==='all')return 'sv';if(!games[dex])throw Error('Choisis Paldea (9), Galar (8) ou Sinnoh (4) dans Dex / Génération.');return games[dex]}
const frenchNames=new Map(),frenchMoves=new Map();
const readableMove=move=>frenchMoves.get(move)||'Capacité en cours de traduction ('+String(move).replace(/-/g,' ')+')';
const typeFr={normal:'Normal',fire:'Feu',water:'Eau',electric:'Électrik',grass:'Plante',ice:'Glace',fighting:'Combat',poison:'Poison',ground:'Sol',flying:'Vol',psychic:'Psy',bug:'Insecte',rock:'Roche',ghost:'Spectre',dragon:'Dragon',dark:'Ténèbres',steel:'Acier',fairy:'Fée'};
async function loadMoveNames(moves){
 const pending=[...new Set(moves)].filter(x=>!frenchMoves.has(x));
 for(let i=0;i<pending.length;i+=8){
  await Promise.all(pending.slice(i,i+8).map(async move=>{try{const r=await fetch('https://pokeapi.co/api/v2/move/'+encodeURIComponent(move)+'/');if(!r.ok)return;const data=await r.json();const name=data.names?.find(n=>n.language?.name==='fr')?.name;if(name)frenchMoves.set(move,name)}catch(e){console.warn('Traduction capacité indisponible',move)}}));
  if(editing)renderEditor();
 }
}

async function loadFrenchNames(draft){
 if(!draft)return;
 const ids=[...new Set(Object.values(draft.boxes||{}).flatMap(rows=>rows.flatMap(row=>row.pokemon.map(p=>p.id))))];
 const pending=ids.filter(id=>!frenchNames.has(id));
 for(let i=0;i<pending.length;i+=6){
  await Promise.all(pending.slice(i,i+6).map(async id=>{
   try{const response=await fetch('https://pokeapi.co/api/v2/pokemon-species/'+id+'/');if(!response.ok)return;
    const data=await response.json();const fr=data.names?.find(n=>n.language?.name==='fr')?.name;
    if(fr)frenchNames.set(id,fr);
   }catch(e){console.warn('Nom français non chargé',id,e)}
  }));
  if(state?.gameId!==draft.gameId)return;
  for(const rows of Object.values(state.boxes||{}))for(const row of rows)for(const p of row.pokemon)if(frenchNames.has(p.id))p.name=frenchNames.get(p.id);
  if(!editing)render();
 }
}
function render(){
 const panel=$('trainerDraftPanel');if(!panel)return;panel.style.display=active()?'block':'none';if(!active())return;
 $('roll').disabled=busy;
 const host=!mpSession||!mpLobbyStarted||mpSession.role==='host',me=seat();
 const start=$('trainerDraftStart');if(start){start.style.display=host?'':'none';start.disabled=busy||(!!mpSession&&(!mpLobbyStarted||!me));}
 const grid=$('trainerDraftGrid'),status=$('trainerDraftStatus');
 if(!state||state.version!==2){
  status.textContent='Configure le budget et le type de boîte, puis clique sur Générer. Sans salon, une boîte locale est créée pour essayer le marché.';
  grid.innerHTML='';$('trainerDraftEditor').innerHTML='';$('trainerDraftTeams').innerHTML='';return;
 }
 const mine=state.choices?.[me]?.entries||[];
 const spent=mine.reduce((s,e)=>s+e.price,0);
 status.textContent=(localMode?'Mode local · ':'')+gameLabel[state.game]+' · '+(state.boxMode==='shared'?'Boîte commune':'Boîtes individuelles')+' · Budget '+state.budget+' $ par joueur · Ton solde '+(state.budget-spent)+' $ · J1 '+(state.choices?.[1]?.entries?.length||0)+'/6 · J2 '+(state.choices?.[2]?.entries?.length||0)+'/6';
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
async function openEditor(rowIndex,offerIndex){
 const me=seat(),row=state?.boxes?.[me]?.[rowIndex],p=row?.pokemon?.[offerIndex];if(!p)return;
 const entries=state.choices?.[me]?.entries||[],other=state.choices?.[me===1?2:1]?.entries||[];
 if(entries.length>=6||entries.some(e=>e.rowIndex===rowIndex&&e.offerIndex===offerIndex)||(state.boxMode==='shared'&&other.some(e=>e.rowIndex===rowIndex&&e.offerIndex===offerIndex)))return;
 if(entries.reduce((s,e)=>s+e.price,0)+row.price>state.budget)return;
 $('trainerDraftStatus').textContent='Chargement des capacités du Pokémon n°'+p.id+'…';
 try{
  if(!p.legalMoves.length){
   const full=await getP(p.id),version={sv:'scarlet-violet',swsh:'sword-shield',bdsp:'brilliant-diamond-and-shining-pearl'}[state.game];
   const moves=[...new Set((full.moves||[]).filter(m=>(m.version_group_details||[]).some(d=>d.version_group?.name===version)).map(m=>m.name))];
   if(moves.length<4)throw Error('Moins de quatre capacités disponibles pour ce Pokémon dans ce jeu.');
   p.name=full.name;p.img=full.img||p.img;p.legalMoves=moves;p.initialMoves=Core.td6Shuffle(moves).slice(0,4);p.nature='Rigide';p.tera=full.types?.[0]||'normal';
  }
  editing={gameId:state.gameId,rowIndex,offerIndex,moves:[...p.initialMoves],nature:p.nature,tera:state.game==='sv'?p.tera:'normal'};render();renderEditor();loadMoveNames(p.legalMoves).catch(console.error);
 }catch(e){$('trainerDraftStatus').textContent='❌ '+e.message;console.error(e)}

}
function renderEditor(){
 const box=$('trainerDraftEditor');if(!editing||editing.gameId!==state?.gameId){box.innerHTML='';return}
 const row=state.boxes[seat()][editing.rowIndex],p=row.pokemon[editing.offerIndex];
 box.innerHTML='<div class="panel"><h3>'+esc(p.name)+' — '+esc(p.lore?.trainer)+' · '+row.price+' $</h3><p>'+esc(p.lore?.source||'')+'</p><div class="controls">'+editing.moves.map((m,i)=>'<label>Capacité '+(i+1)+'<select data-move="'+i+'">'+p.legalMoves.map(x=>'<option value="'+esc(x)+'" '+(m===x?'selected':'')+'>'+esc(readableMove(x))+'</option>').join('')+'</select></label>').join('')+'<label>Nature<select id="draftNature">'+Core.TD6_NATURES.map(n=>'<option '+(n===editing.nature?'selected':'')+'>'+esc(typeFr[n]||n)+'</option>').join('')+'</select></label>'+(state.game==='sv'?'<label>Type Téra<select id="draftTera">'+Core.TD6_TYPES.map(n=>'<option '+(n===editing.tera?'selected':'')+'>'+esc(typeFr[n]||n)+'</option>').join('')+'</select></label>':'')+'</div><button id="draftBuy" type="button">Acheter</button><button id="draftCancel" type="button">Annuler</button></div>';
 box.querySelectorAll('[data-move]').forEach(el=>el.onchange=()=>editing.moves[+el.dataset.move]=el.value);
 $('draftNature').onchange=e=>editing.nature=e.target.value;if($('draftTera'))$('draftTera').onchange=e=>editing.tera=e.target.value;
 $('draftBuy').onclick=()=>choose().catch(e=>{alert(e.message);console.error(e)});
 $('draftCancel').onclick=()=>{editing=null;renderEditor()};
}
async function start(){
 if(busy)return;if(!active())throw Error('Sélectionne Marché & Draft.');
 const offline=!mpSession||!mpLobbyStarted;if(!offline&&(!MPAUTH?.currentUser||mpSession.id!==MPAUTH.currentUser.uid))throw Error('Session Firebase invalide.');
 busy=true;render();
 try{
  const room=offline?{}:(await mpRoom(mpSession.room).once('value')).val()||{};
  if(!offline&&room.ownerUid!==mpSession.id)throw Error('Seul l’hôte peut générer.');
  if(!offline&&(!room.started||!room.seats?.[1]||!room.seats?.[2]||room.seats[1]===room.seats[2]))throw Error('Deux joueurs attribués sont nécessaires.');
  const game=selectedGame(),budget=Number($('trainerDraftBudget').value),boxMode=$('trainerDraftBoxMode').value;
  if(!Number.isInteger(budget)||budget<1||budget>100000)throw Error('Budget entre 1 et 100 000 $ requis.');
  $('trainerDraftStatus').textContent='Chargement des associations de dresseurs et Pokémon compatibles…';
  const candidates=[...new Set(Core.TD6_LORE.map(x=>x.id))].map(id=>({id,name:'Pokémon n°'+id,img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'+id+'.png',legalMoves:[],initialMoves:[],nature:'Hardi',tera:'normal'}));
  const ref=offline?null:mpRoom(mpSession.room).child('trainerDraft6'),prior=offline?state:(await ref.once('value')).val();
  if(prior&&((prior.choices?.[1]?.entries?.length||0)+(prior.choices?.[2]?.entries?.length||0))>0&&!confirm('Effacer les achats actuels des deux joueurs ?'))return;
  const next=Core.td6Create(candidates,prior,Math.random,game,budget,boxMode);
  next.gameId=(offline?'local-':mpId())+Date.now();next.choices[1].gameId=next.gameId;next.choices[2].gameId=next.gameId;
  if(offline){localMode=true;state=next;editing=null;render();loadFrenchNames(next).catch(console.error);return;}localMode=false;const tx=await ref.transaction(current=>{if((current?.gameId||null)!==(prior?.gameId||null)||(current?.created||null)!==(prior?.created||null))return;return next});
  if(!tx.committed)throw Error('Partie modifiée pendant la génération.');
  state=tx.snapshot.val();editing=null;render();loadFrenchNames(state).catch(console.error);
 }finally{busy=false;render()}
}
async function choose(){
 if(busy||!editing||!state)return;
 const me=seat();if(!me||(!localMode&&(!mpLobbyStarted||MPAUTH?.currentUser?.uid!==mpSession?.id)))throw Error('Session réseau non autorisée.');
 const draft=state,form={moves:[...editing.moves],nature:editing.nature,tera:editing.tera};
 if(localMode){state.choices[me]=Core.td6AddChoice(state,me,editing.rowIndex,editing.offerIndex,form);editing=null;render();return;}
 busy=true;
 try{
  const ref=mpRoom(mpSession.room).child('trainerDraft6');
  const tx=await ref.transaction(current=>{try{if(current?.gameId!==draft.gameId)return;const p=current.boxes?.[me]?.[editing.rowIndex]?.pokemon?.[editing.offerIndex];if(!p)return;const source=draft.boxes?.[me]?.[editing.rowIndex]?.pokemon?.[editing.offerIndex];if(source?.legalMoves?.length){p.legalMoves=source.legalMoves;p.initialMoves=source.initialMoves;p.name=source.name;p.nature=source.nature;p.tera=source.tera;}current.choices[me]=Core.td6AddChoice(current,me,editing.rowIndex,editing.offerIndex,form);return current}catch(e){console.warn('Achat rejeté',e);return}});
  if(!tx.committed)throw Error('Achat refusé : case déjà prise, budget insuffisant ou partie modifiée.');
  state=tx.snapshot.val();editing=null;render();
 }finally{busy=false;render()}
}
function receive(value){if(localMode){if(!mpSession||!mpLobbyStarted)return;localMode=false;}state=value||null;if(editing&&editing.gameId!==state?.gameId)editing=null;render();if(state?.version===2)loadFrenchNames(state).catch(console.error)}
window.TrainerDraft6={start,receive,render};
})();
