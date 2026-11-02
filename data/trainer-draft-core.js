'use strict';
const TD6_START_BUDGET=6000;
const TD6_RANK_PRICES={1:200,2:450,3:750,4:1000,5:1150,6:1500};
const TD6_RANKS=[{id:1,label:"Dresseurs ordinaires",icon:"🧢"},{id:2,label:"Spires d’organisation",icon:"🅁"},{id:3,label:"Champions d’Arène",icon:"🏅"},{id:4,label:"Rivaux",icon:"⚡"},{id:5,label:"Admins et chefs d’organisation",icon:"👑"},{id:6,label:"Conseil 4 et Maîtres de Ligue",icon:"🏆"}];
// Catégories de dresseurs officielles : les Pokémon restent des propositions aléatoires,
// et ne sont pas présentés comme les équipes canoniques de ces personnages.
const TD6_TRAINERS_BY_RANK={
 1:["Gamin","Fillette","Topdresseur"],
 2:["Sbire Team Rocket","Sbire Team Galaxie","Sbire Team Star"],
 3:["Éra","Colza","Mashynn","Kombu","Okuba","Laïm","Tully","Grusha"],
 4:["Menzi","Pepper","Blue","Silver","Tcheren"],
 5:["Giovanni","Hélio","Ghetis","Meloco","Brome","Nèflie"],
 6:["Alisma","Cayenn","Popi","Hassa","Cynthia","Tarak"]
};
const TD6_TRAINERS=Object.values(TD6_TRAINERS_BY_RANK).flat();
const TD6_POOL=[25,26,183,184,187,188,189,198,200,203,204,205,206,215,216,217,228,229,231,232,280,281,282,283,284,285,286,287,288,289,296,297,302,307,308,316,317,322,323,324,325,326,333,334,339,340,353,354,357,361,362,371,372,373,396,397,398,403,404,405,415,416,418,419,425,426,429,443,444,445,447,448,449,450,453,454,456,457,459,460,461,462,470,471,475,479,700];
const TD6_NATURES=["Hardi","Solo","Brave","Rigide","Mauvais","Assuré","Docile","Relax","Malin","Lâche","Timide","Pressé","Sérieux","Jovial","Naïf","Modeste","Doux","Discret","Foufou","Pudique","Calme","Gentil","Malpoli","Prudent","Bizarre"];
const TD6_TYPES=["normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy"];
const TD6_ITEMS=[["leftovers","Restes"],["sitrus-berry","Baie Sitrus"],["shell-bell","Grelot Coque"],["expert-belt","Ceinture Pro"]];
function td6Shuffle(input,rng=Math.random){const a=[...input];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function td6Create(offers,previous,rng=Math.random){
 if(!Array.isArray(offers)||offers.length<18)throw Error("Il faut 18 Pokémon validés.");
 const unique=new Map(offers.map(x=>[x.id,x]));if(unique.size<18)throw Error("Il faut 18 espèces distinctes.");
 let trainers,selected,signature;
 for(let attempt=0;attempt<8;attempt++){
  trainers=TD6_RANKS.slice().reverse().map(rank=>td6Shuffle(TD6_TRAINERS_BY_RANK[rank.id],rng)[0]);
  selected=td6Shuffle([...unique.values()],rng).slice(0,18);
  signature=trainers.join("|")+"#"+selected.map(x=>x.id).join(",");
  if(signature!==previous?.signature)break;
 }
 return {version:1,game:"sv",gameId:"",budget:TD6_START_BUDGET,signature,trainers,offers:trainers.map((trainer,i)=>({trainer,rank:TD6_RANKS[5-i],pokemon:selected.slice(i*3,i*3+3)})),choices:{"1":{gameId:"",entries:[]},"2":{gameId:"",entries:[]}},created:Date.now()};
}
function td6AddChoice(state,seat,trainerIndex,offerIndex,custom){
 if(!state||state.version!==1||state.game!=="sv"||![1,2].includes(Number(seat)))throw Error("Partie invalide.");
 const current=state.choices?.[seat]||state.choices?.[String(seat)];
 if(!current||current.gameId!==state.gameId||(current.entries!=null&&!Array.isArray(current.entries)))throw Error("Partie modifiée : recharge les choix.");
 const entries=Array.isArray(current.entries)?current.entries:[];
 if(entries.length>=6)throw Error("Les six manches sont terminées.");
 if(!Number.isInteger(trainerIndex)||trainerIndex<0||trainerIndex>5||!Number.isInteger(offerIndex)||offerIndex<0||offerIndex>2)throw Error("Proposition inconnue.");
 if(entries.some(e=>e.trainerIndex===trainerIndex))throw Error("Dresseur déjà utilisé par ce joueur.");
 const taken=[...(state.choices?.[1]?.entries||[]),...(state.choices?.[2]?.entries||[])];
 if(taken.some(e=>e.trainerIndex===trainerIndex&&e.offerIndex===offerIndex))throw Error("Case déjà sélectionnée dans cette partie.");
 const offer=state.offers?.[trainerIndex]?.pokemon?.[offerIndex];
 if(!offer||!Array.isArray(offer.legalMoves)||offer.legalMoves.length<4)throw Error("Pokémon sans données légales.");
 const moves=custom?.moves;
 if(!Array.isArray(moves)||moves.length!==4||new Set(moves).size!==4||moves.some(m=>!offer.legalMoves.includes(m)))throw Error("Les quatre capacités doivent être distinctes et légales.");
 if(!TD6_NATURES.includes(custom?.nature))throw Error("Nature invalide.");
 if(!TD6_TYPES.includes(custom?.tera))throw Error("Type Téracristal invalide.");
 const price=TD6_RANK_PRICES[state.offers[trainerIndex].rank?.id]||0;
 const spent=entries.reduce((sum,e)=>sum+(e.price||TD6_RANK_PRICES[state.offers[e.trainerIndex]?.rank?.id]||0),0);
 if(spent+price>(state.budget||TD6_START_BUDGET))throw Error("Budget de Pokédollars insuffisant.");
 const entry={trainerIndex,offerIndex,price,pokemonId:offer.id,moves:[...moves],nature:custom.nature,tera:custom.tera};
 return {gameId:state.gameId,entries:[...entries,entry]};
}
const TrainerDraftCore={TD6_START_BUDGET,TD6_RANK_PRICES,TD6_RANKS,TD6_TRAINERS,TD6_TRAINERS_BY_RANK,TD6_POOL,TD6_NATURES,TD6_TYPES,TD6_ITEMS,td6Shuffle,td6Create,td6AddChoice};
if(typeof module!=='undefined'&&module.exports)module.exports=TrainerDraftCore;
if(typeof window!=='undefined')window.TrainerDraftCore=TrainerDraftCore;
