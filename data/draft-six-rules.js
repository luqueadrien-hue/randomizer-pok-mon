'use strict';
// Draft des 6 Dresseurs : moteur de règles pur, distinct du Marché.
// N'activer dans l'interface réseau qu'après intégration d'un catalogue légal vérifié.
const GAMES=['sv','swsh','bdsp'];
const NATURES=['Hardi','Solo','Brave','Rigide','Mauvais','Assuré','Docile','Relax','Malin','Lâche','Timide','Pressé','Sérieux','Jovial','Naïf','Modeste','Doux','Discret','Foufou','Pudique','Calme','Gentil','Malpoli','Prudent','Bizarre'];
const TYPES=['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];
const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
const copy=x=>JSON.parse(JSON.stringify(x));
function validOffer(p,game){
 assert(p&&typeof p==='object'&&typeof p.species==='string'&&p.species.length>0,'Espèce manquante');
 assert(p.game===game&&p.verified===true&&typeof p.source==='string'&&/^https:\/\//.test(p.source),'Proposition non vérifiée pour le jeu');
 assert(typeof p.ability==='string'&&p.ability.length>0&&typeof p.item==='string'&&p.item.length>0,'Talent ou objet manquant');
 assert(Array.isArray(p.legalMoves)&&p.legalMoves.length>=4&&new Set(p.legalMoves).size===p.legalMoves.length,'Capacités légales manquantes');
 assert(Array.isArray(p.moves)&&p.moves.length===4&&new Set(p.moves).size===4&&p.moves.every(m=>p.legalMoves.includes(m)),'Attaques initiales invalides');
 for(const key of ['evs','ivs']){assert(Array.isArray(p[key])&&p[key].length===6,'Répartition '+key+' invalide');assert(p[key].every(n=>Number.isInteger(n)&&n>=0&&n<=(key==='evs'?252:31)),'Valeur '+key+' invalide')}
 assert(p.evs.reduce((a,b)=>a+b,0)<=510,'Total EV supérieur à 510');
 assert(NATURES.includes(p.nature),'Nature invalide');
 if(game==='sv')assert(TYPES.includes(p.tera),'Type Téracristal manquant');
 else assert(p.tera==null,'Téracristallisation indisponible');
}
function create({game,trainers,offers,previousTrainerIds=[],rng=Math.random}){
 assert(GAMES.includes(game),'Jeu Switch non pris en charge');
 assert(Array.isArray(trainers)&&Array.isArray(offers),'Catalogue absent');
 const eligible=trainers.filter(t=>t&&typeof t.id==='string'&&t.id&&typeof t.name==='string'&&t.name&&Array.isArray(t.games)&&t.games.includes(game));
 assert(new Set(eligible.map(t=>t.id)).size===eligible.length,'Identifiants de dresseurs en double');
 assert(eligible.length>=6,'Moins de six dresseurs vérifiés pour ce jeu');
 const shuffled=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const roll=rng();assert(typeof roll==='number'&&Number.isFinite(roll)&&roll>=0&&roll<1,'Générateur aléatoire invalide');const j=Math.floor(roll*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 const fresh=shuffled(eligible.filter(t=>!previousTrainerIds.includes(t.id)));
 const chosen=[...fresh,...shuffled(eligible.filter(t=>previousTrainerIds.includes(t.id)))].slice(0,6);
 const byTrainer=chosen.map(t=>({id:t.id,name:t.name,offers:[]}));
 const available=shuffled(offers.filter(p=>p.game===game));
 // Ne jamais accepter une proposition non vérifiée au milieu d'un catalogue :
 // une entrée invalide ne doit pas empêcher de tirer les 18 propositions valides.
 const verified=[];
 for(const p of available){try{validOffer(p,game);verified.push(p)}catch(_){/* Offre exclue, sans validation de légalité externe implicite. */}}
 const seen=new Set();
 for(const t of byTrainer){
  for(const p of verified){
   const key=p.species+'|'+(p.form||'');
   if(seen.has(key)||t.offers.length===3)continue;
   seen.add(key);t.offers.push(copy(p));
  }
  assert(t.offers.length===3,'Catalogue légal insuffisant : 18 espèces/formes distinctes requises');
 }
 return {version:1,mode:'draft-six-trainers',game,trainers:byTrainer,players:{'1':[],'2':[]},turn:1};
}
function choose(state,seat,trainerId,offerIndex,custom){
 assert(state&&state.mode==='draft-six-trainers'&&GAMES.includes(state.game),'Partie invalide');
 assert(seat===1||seat===2,'Joueur invalide');
 assert(state.turn===seat,'Ce n’est pas ton tour');
 const mine=state.players[String(seat)],other=state.players[String(3-seat)];
 assert(Array.isArray(mine)&&Array.isArray(other)&&mine.length<6,'Équipe complète ou état invalide');
 assert(Array.isArray(state.trainers)&&state.trainers.length===6&&new Set(state.trainers.map(t=>t.id)).size===6,'Dresseurs de partie invalides');
 assert(mine.every(c=>c&&state.trainers.some(t=>t.id===c.trainerId))&&other.every(c=>c&&state.trainers.some(t=>t.id===c.trainerId)),'Historique de choix invalide');
 const trainer=state.trainers.find(t=>t.id===trainerId);
 assert(trainer&&!mine.some(c=>c.trainerId===trainerId),'Dresseur absent ou déjà utilisé par ce joueur');
 assert(Number.isInteger(offerIndex)&&offerIndex>=0&&offerIndex<3,'Proposition inconnue');
 const offer=trainer.offers[offerIndex];validOffer(offer,state.game);
 assert(custom&&Array.isArray(custom.moves)&&custom.moves.length===4&&new Set(custom.moves).size===4&&custom.moves.every(m=>offer.legalMoves.includes(m)),'Quatre attaques légales distinctes requises');
 assert(NATURES.includes(custom.nature),'Nature invalide');
 assert(state.game==='sv'?TYPES.includes(custom.tera):custom.tera==null,'Téracristallisation invalide');
 const next=copy(state);
 next.players[String(seat)].push({trainerId,offerIndex,species:offer.species,form:offer.form||'',moves:[...custom.moves],nature:custom.nature,tera:state.game==='sv'?custom.tera:null});
 next.turn=next.players['1'].length===6&&next.players['2'].length===6?0:3-seat;
 return next;
}
const api={GAMES,NATURES,TYPES,validOffer,create,choose};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(typeof window!=='undefined')window.TrainerDraftSixRules=api;
