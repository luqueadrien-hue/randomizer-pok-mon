'use strict';
// Moteur isolé du Marché : aucune exclusivité entre joueurs.
function check(ok,msg){if(!ok)throw Error(msg)}
function shuffle(a,rng){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function createDraft({game,trainers,offers,previousTrainerIds=[],rng=Math.random}){
 check(['sv','swsh','bdsp'].includes(game),'Jeu non pris en charge');
 const pool=[...new Map(trainers.filter(t=>t.games?.includes(game)).map(t=>[t.id,t])).values()];
 check(pool.length>=6,'Catalogue de dresseurs insuffisant');
 const fresh=pool.filter(t=>!previousTrainerIds.includes(t.id));
 const chosen=shuffle(fresh.length>=6?fresh:pool,rng).slice(0,6);
 const legal=offers.filter(p=>p.verified===true&&p.games?.includes(game)&&p.ability&&p.item&&
 Array.isArray(p.legalMoves)&&p.legalMoves.length>=4&&Array.isArray(p.initialMoves)&&
 p.initialMoves.length===4&&new Set(p.initialMoves).size===4&&p.initialMoves.every(m=>p.legalMoves.includes(m))&&
 Array.isArray(p.evs)&&p.evs.length===6&&p.evs.every(n=>Number.isInteger(n)&&n>=0&&n<=252)&&p.evs.reduce((a,b)=>a+b,0)<=510&&
 Array.isArray(p.ivs)&&p.ivs.length===6&&p.ivs.every(n=>Number.isInteger(n)&&n>=0&&n<=31));
 const distinct=[...new Map(legal.map(p=>[p.formId||String(p.id),p])).values()];
 check(distinct.length>=18,'Moins de 18 sets vérifiés disponibles');
 const picks=shuffle(distinct,rng).slice(0,18);
 return {version:1,mode:'draft-six-trainers',game,trainers:chosen.map((t,i)=>({id:t.id,name:t.name,offers:picks.slice(i*3,i*3+3)})),choices:{1:[],2:[]}};
}
function choose(state,seat,trainerId,form){
 check(seat===1||seat===2,'Joueur invalide');
 const trainer=state.trainers.find(t=>t.id===trainerId);check(trainer,'Dresseur inconnu');
 const previous=state.choices[seat];check(previous.length<6,'Six choix maximum');
 check(!previous.some(c=>c.trainerId===trainerId),'Dresseur déjà utilisé par ce joueur');
 const p=trainer.offers.find(p=>(p.formId||String(p.id))===form.formId);check(p,'Pokémon non proposé');
 check(Array.isArray(form.moves)&&form.moves.length===4&&new Set(form.moves).size===4&&form.moves.every(m=>p.legalMoves.includes(m)),'Attaques illégales');
 check(typeof form.nature==='string'&&form.nature.length>0,'Nature requise');
 if(state.game==='sv')check(typeof form.tera==='string'&&form.tera.length>0,'Type Téra requis');
 else check(form.tera===undefined,'Téracristallisation indisponible');
 return {...state,choices:{...state.choices,[seat]:[...previous,{trainerId,formId:form.formId,moves:[...form.moves],nature:form.nature,...(state.game==='sv'?{tera:form.tera}:{})}]}};
}
module.exports={createDraft,choose};
