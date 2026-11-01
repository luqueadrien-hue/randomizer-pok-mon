// Tests sans Firebase réel : node --test tests/trainer-market.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const extraCode=readFileSync(new URL('../data/trainer-market-expansion.js',import.meta.url),'utf8');
const windowStub={};
new Function('window',extraCode)(windowStub);
const extra=windowStub.TRAINER_MARKET_EXPANSION;
function readConst(name,terminator){
 const start=html.indexOf('const '+name+'=');
 assert.ok(start>=0,name+' absent');
 const end=html.indexOf(terminator,start);
 assert.ok(end>start,name+' incomplet');
 return new Function(html.slice(start,end+terminator.length)+';return '+name)();
}
const ranks=readConst('TRAINER_MARKET_RANKS','];');
const seed=readConst('TRAINER_MARKET_SEED','];');
const sources=readConst('TRAINER_MARKET_SOURCES','};');
const forms=readConst('TRAINER_MARKET_FORM_GAMES','};');
const dexes=readConst('TRAINER_MARKET_DEXES','};');
const optional=readConst('TRAINER_MARKET_OPTIONAL_DEXES','};');
const hisui=readConst('TRAINER_MARKET_HISUI_ATTESTED',');');
const plaExcluded=readConst('TRAINER_MARKET_PLA_BASE_EXCLUDED',');');
const home=readConst('TRAINER_MARKET_HOME_VERIFIED','};');
const allSeed=seed.concat(extra);
const dlc={
 sv:new Set(allSeed.filter(x=>['SV_BB','SV_BB_TRIAL','SV_KITAKAMI'].includes(x[4])).map(x=>x[1])),
 swsh:new Set(allSeed.filter(x=>x[4]==='SWSH').map(x=>x[1]))
};
const startSource=html.slice(html.indexOf('async function trainerMarketStart(){'),html.indexOf('async function trainerMarketBuy(key){')).trim();
const buySource=html.slice(html.indexOf('async function trainerMarketBuy(key){'),html.indexOf('\n</script>',html.indexOf('async function trainerMarketBuy(key){'))).trim();
const payload=ids=>({pokemon_entries:ids.map(id=>({pokemon_species:{url:'https://pokeapi.co/api/v2/pokemon-species/'+id+'/'}}))});
function eligibleFn(apiJson){
 return new Function('apiJson','TRAINER_MARKET_DEXES','TRAINER_MARKET_OPTIONAL_DEXES','TRAINER_MARKET_DLC_ATTESTED','TRAINER_MARKET_HISUI_ATTESTED','TRAINER_MARKET_HOME_VERIFIED','return ('+html.slice(html.indexOf('async function trainerMarketEligible('),html.indexOf('let trainerMarketState=null;',html.indexOf('async function trainerMarketEligible('))).trim()+')')(
  apiJson,dexes,optional,dlc,hisui,home
 );
}
function fakeMarket(budget=3000,game='sv',ids=new Set(Array.from({length:1025},(_,i)=>i+1))){
 let market=null,resetCount=0;
 const alerts=[],controls={
  trainerMarketBudget:{value:String(budget)},trainerMarketGame:{value:game},trainerMarketHome:{checked:true},
  trainerMarketStatus:{textContent:''}
 };
 const document={getElementById:id=>controls[id]};
 const ref={
  once:async()=>({val:()=>market}),
  transaction:async fn=>{const next=fn(market);if(next===undefined)return {committed:false};market=next;return {committed:true};}
 };
 const room=()=>({
  once:async()=>({val:()=>({ownerUid:'A'})}),
  child:()=>ref
 });
 const deps={
  gameMode:{value:'trainerrankgrid'},mpSession:{id:'A',room:'TEST'},mpLobbyStarted:true,mpSeats:{1:'A',2:'B'},
  mpRoom:room,document,MPAUTH:{currentUser:{uid:'A'}},trainerMarketEligible:async()=>({ids,dlcIds:new Set(),homeIds:new Set(),source:'Test',partial:false}),
  TRAINER_MARKET_ALL_SEED:allSeed,TRAINER_MARKET_SOURCES:sources,TRAINER_MARKET_FORM_GAMES:forms,
  TRAINER_MARKET_PLA_BASE_EXCLUDED:plaExcluded,trainerMarketRender:()=>{},confirm:()=>{resetCount++;return true;}
 };
 const start=new Function(...Object.keys(deps),'let trainerMarketState=null;return ('+startSource+')')(...Object.values(deps));
 const makeBuy=(id)=>new Function('mpSession','mpLobbyStarted','gameMode','mpSeats','mpRoom','TRAINER_MARKET_RANKS','MPAUTH','alert','return ('+buySource+')')(
  {id,room:'TEST'},true,{value:'trainerrankgrid'},{1:'A',2:'B'},room,ranks,{currentUser:{uid:id}},x=>alerts.push(x)
 );
 return {start,buy1:makeBuy('A'),buy2:makeBuy('B'),state:()=>market,alerts,resetCount:()=>resetCount};
}

test('huit rangs et provenance Kanto–Paldea, source documentée',()=>{
 assert.deepEqual(ranks.map(x=>x[1]),[200,350,500,650,700,800,1000,1300]);
 assert.equal(extra.length,354);
 assert.equal(allSeed.length,604);
 assert.ok(Array.from({length:8},(_,i)=>i+1).every(rank=>allSeed.some(x=>x[0]===rank)));
 assert.ok(allSeed.every(x=>sources[x[4]||'SV']));
 assert.ok(allSeed.every(x=>x[1]>=1&&x[1]<=1025&&x[2]&&x[3]));
 assert.ok(allSeed.some(x=>x[3]==='Nérine'&&x[5]==='dugtrio-alola'));
 assert.ok(allSeed.some(x=>x[3]==='Professeur Euphorbe (autre starter)'));
});
test('création : clés Firebase uniques, huit rangs, sources, formes',async()=>{
 const m=fakeMarket();
 await m.start();
 const catalog=m.state().catalog;
 assert.equal(catalog.length,602);
 assert.equal(new Set(catalog.map(x=>x.key)).size,catalog.length);
 assert.ok(catalog.every(x=>!/[.#$\[\]/]/.test(x.key)));
 assert.ok(catalog.every(x=>x.sourceUrl&&x.sourceGeneration>=1&&x.sourceGeneration<=9));
 const alola=catalog.find(x=>x.formKey==='dugtrio-alola');
 const base=catalog.find(x=>x.id===51&&!x.formKey);
 assert.ok(alola&&base);
 assert.notEqual(alola.pokemonKey,base.pokemonKey);
});
test('achat exclusif dans deux rangs, budget et plafond de six',async()=>{
 const m=fakeMarket();
 await m.start();
 const catalog=m.state().catalog;
 const ordinary=catalog.find(x=>x.rank===1&&x.id===19);
 const rocket=catalog.find(x=>x.rank===2&&x.id===19);
 assert.ok(ordinary&&rocket);
 await m.buy1(ordinary.key);
 await m.buy2(rocket.key);
 assert.equal(m.state().teams[1].length,1);
 assert.equal(m.state().teams[2].length,0);
 assert.equal(m.state().spent[1],200);
 assert.equal(m.state().purchaseCount,1);
 assert.equal(m.alerts.length,1);
 const unique=[...new Map(catalog.filter(x=>x.rank===1).map(x=>[x.pokemonKey,x])).values()].filter(x=>x.pokemonKey!==ordinary.pokemonKey);
 for(const x of unique.slice(0,6))await m.buy1(x.key);
 assert.equal(m.state().teams[1].length,6);
 assert.equal(m.state().purchaseCount,6);
});
test('refus budget insuffisant et maintien du budget de J2',async()=>{
 const m=fakeMarket(1500);await m.start();
 const expensive=m.state().catalog.find(x=>x.rank===8);
 assert.ok(expensive);
 await m.buy1(expensive.key);
 const another=m.state().catalog.find(x=>x.rank===8&&x.pokemonKey!==expensive.pokemonKey);
 await m.buy1(another.key);
 assert.equal(m.state().teams[1].length,1);
 assert.equal(m.state().spent[1],1300);
 assert.equal(m.state().spent[2],0);
});
test('filtrage des formes de base incompatibles avec Hisui',async()=>{
 const m=fakeMarket(3000,'pla');
 await m.start();
 assert.ok(!m.state().catalog.some(x=>x.id===157&&!x.formKey));
 assert.ok(m.state().catalog.some(x=>x.id===25));
 assert.ok(!m.state().catalog.some(x=>x.formKey==='ninetales-alola'));
});
test('repli contrôlé pour les DLC indisponibles, erreur sur base SV absente',async()=>{
 const api=async url=>{
  if(url.endsWith('/paldea'))return payload([25,19]);
  throw Error('404 simulée');
 };
 const eligible=eligibleFn(api);
 const sv=await eligible('sv',true);
 assert.ok(sv.ids.has(25));
 assert.ok(sv.dlcIds.has(1019));
 assert.equal(sv.partial,true);
 const pla=await eligible('pla',false);
 assert.ok(pla.ids.has(25));
 assert.equal(pla.partial,true);
 const bad=eligibleFn(async()=>{throw Error('Réseau indisponible')});
 await assert.rejects(()=>bad('sv',true),/Pokédex de base indisponible/);
 const bdsp=await eligible('bdsp',false);
 assert.equal(bdsp.ids.has(493),true);
 assert.equal(bdsp.ids.has(494),false);
});
test('réinitialisation ne conserve aucun achat',async()=>{
 const m=fakeMarket();await m.start();
 await m.buy1(m.state().catalog.find(x=>x.rank===1).key);
 await m.start();
 assert.equal(m.state().teams[1].length,0);
 assert.equal(m.state().purchaseCount,0);
 assert.equal(m.resetCount(),1);
});

test('deux achats simultanés du même Pokémon : une seule transaction gagnante',async()=>{
 const m=fakeMarket();await m.start();
 const key=m.state().catalog.find(x=>x.rank===1).key;
 await Promise.all([m.buy1(key),m.buy2(key)]);
 assert.equal(m.state().teams[1].length+m.state().teams[2].length,1);
 assert.equal(m.state().purchaseCount,1);
});
test('formes régionales distinctes dans le stock partagé',async()=>{
 const m=fakeMarket();await m.start();
 const base=m.state().catalog.find(x=>x.id===51&&!x.formKey);
 const alola=m.state().catalog.find(x=>x.id===51&&x.formKey==='dugtrio-alola');
 assert.ok(base&&alola);
 await m.buy1(base.key);
 await m.buy2(alola.key);
 assert.equal(m.state().teams[1].length,1);
 assert.equal(m.state().teams[2].length,1);
 assert.notEqual(m.state().teams[1][0].pokemonKey,m.state().teams[2][0].pokemonKey);
});

test('Arcanin de Hisui disponible dans PLA sans autoriser Arcanin normal',async()=>{
 const m=fakeMarket(3000,'pla',new Set([59]));
 await m.start();
 const entries=m.state().catalog.filter(x=>x.id===59);
 assert.ok(entries.some(x=>x.formKey==='arcanine-hisui'));
 assert.ok(!entries.some(x=>!x.formKey));
 const eligible=eligibleFn(async()=>{throw Error('API simulée indisponible')});
 const result=await eligible('pla',false);
 assert.ok(result.ids.has(59));
});
