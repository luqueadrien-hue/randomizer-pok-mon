// Exécuter : node --test tests/trainer-market.test.mjs
// Tests unitaires locaux : ne remplacent pas deux clients Firebase réels.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function arrayFromHtml(name){
 const start=html.indexOf('const '+name+'=');
 assert.ok(start>=0,name+' absent');
 const end=html.indexOf('];',start)+2;
 return new Function(html.slice(start,end)+';return '+name)();
}
const ranks=arrayFromHtml('TRAINER_MARKET_RANKS');
const seed=arrayFromHtml('TRAINER_MARKET_SEED');
const catalog=seed.map(([rank,id,name,trainer,sourceGame='SV',formKey=''])=>({
 rank,id,name,trainer,key:'r'+rank+'p'+id+'t'+trainer+'g'+sourceGame,
 pokemonKey:String(id)+(formKey?':'+formKey:'')
}));
const buySource=html.slice(html.indexOf('async function trainerMarketBuy(key){'),html.indexOf('\n</script>',html.indexOf('async function trainerMarketBuy(key){'))).trim();

function fakeMarket(budget=3000){
 let state={version:2,budget,catalog,teams:{1:[],2:[]},spent:{1:0,2:0},sold:{}};
 const alerts=[];
 const room=()=>({child:()=>({transaction:async fn=>{
  const next=fn(state);
  if(next===undefined)return {committed:false};
  state=next;return {committed:true};
 }})});
 const make=(id)=>new Function('mpSession','mpLobbyStarted','gameMode','mpSeats','mpRoom','TRAINER_MARKET_RANKS','alert','return ('+buySource+')')(
  {id,room:'TEST'},true,{value:'trainerrankgrid'},{1:'A',2:'B'},room,ranks,x=>alerts.push(x)
 );
 return {buy1:make('A'),buy2:make('B'),state:()=>state,alerts};
}
test('huit rangs à prix fixes et provenance Kanto/Johto/Paldea',()=>{
 assert.equal(ranks.length,8);
 assert.deepEqual(ranks.map(x=>x[1]),[200,350,500,650,700,800,1000,1300]);
 assert.ok(seed.some(x=>x[0]===1&&x[4]==='GSC'));
 assert.ok(seed.some(x=>x[0]===7&&x[4]==='RB'));
 assert.ok(seed.some(x=>x[0]===5));
 assert.equal(new Set(catalog.map(x=>x.key)).size,catalog.length);
});
test('achat exclusif pour un Pokémon présent dans plusieurs rangs',async()=>{
 const m=fakeMarket(3000);
 const first=catalog.find(x=>x.rank===1&&x.id===19);
 const other=catalog.find(x=>x.rank===2&&x.id===19);
 assert.ok(first&&other);
 await m.buy1(first.key);await m.buy2(other.key);
 assert.equal(m.state().teams[1].length,1);
 assert.equal(m.state().teams[2].length,0);
 assert.equal(m.state().spent[1],200);
 assert.equal(m.alerts.length,1);
});
test('budget indépendant et plafond de six Pokémon',async()=>{
 const m=fakeMarket(3000);
 const choices=catalog.filter(x=>x.rank===1&&new Set(catalog.filter(y=>y.rank===1&&y.id===x.id).map(y=>y.id)).size===1);
 const unique=[...new Map(choices.map(x=>[x.pokemonKey,x])).values()];
 assert.ok(unique.length>=7);
 for(const x of unique.slice(0,7))await m.buy1(x.key);
 assert.equal(m.state().teams[1].length,6);
 assert.equal(m.state().spent[1],1200);
 assert.equal(m.alerts.length,1);
 assert.equal(m.state().spent[2],0);
});
test('filtre de jeu et Pokédex : refus des données vides',async()=>{
 const begin=html.indexOf('async function trainerMarketEligible(');
 const end=html.indexOf('let trainerMarketState=null;',begin);
 const src=html.slice(begin,end).trim();
 const make=apiJson=>new Function('apiJson','TRAINER_MARKET_DEXES','TRAINER_MARKET_HOME_VERIFIED','return ('+src+')')(
  apiJson,{sv:['paldea','kitakami','blueberry'],swsh:['galar','isle-of-armor','crown-tundra'],pla:['hisui']},
  {sv:new Set([150]),swsh:new Set([151])}
 );
 const ok=make(async()=>({pokemon_entries:[{pokemon_species:{url:'https://pokeapi.co/api/v2/pokemon-species/25/'}}]}));
 assert.equal((await ok('sv',false)).ids.has(25),true);
 assert.equal((await ok('bdsp',false)).ids.has(494),false);
 const bad=make(async()=>({pokemon_entries:[]}));
 await assert.rejects(()=>bad('sv',true),/Pokédex/);
});
