import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
const require=createRequire(import.meta.url);
const C=require('../data/trainer-draft-core.js');
const offer=id=>({id,name:'Pokémon '+id,legalMoves:['tackle','growl','protect','rest','quick-attack'],initialMoves:['tackle','growl','protect','rest'],nature:'Hardi',tera:'normal'});
const make=()=>{
 const state=C.td6Create(Array.from({length:40},(_,i)=>offer(i+1)));
 state.gameId='partie-test';
 state.choices[1].gameId=state.gameId;
 state.choices[2].gameId=state.gameId;
 return state;
};
const custom={moves:['tackle','growl','protect','rest'],nature:'Hardi',tera:'normal'};
test('6 dresseurs distincts, 3 Pokémon chacun et 18 propositions sans doublon',()=>{
 for(let i=0;i<30;i++){
  const state=make();
  assert.equal(state.trainers.length,6);
  assert.equal(new Set(state.trainers).size,6);
  assert.deepEqual(state.offers.map(x=>x.pokemon.length),[3,3,3,3,3,3]);
  assert.equal(new Set(state.offers.flatMap(x=>x.pokemon.map(p=>p.id))).size,18);
 }
});
test('chaque joueur peut choisir le même dresseur et le même Pokémon',()=>{
 const state=make();
 state.choices[1]=C.td6AddChoice(state,1,0,0,custom);
 state.choices[2]=C.td6AddChoice(state,2,0,0,custom);
 assert.equal(state.choices[1].entries[0].pokemonId,state.choices[2].entries[0].pokemonId);
});
test('un dresseur ne peut être utilisé deux fois par le même joueur',()=>{
 const state=make();
 state.choices[1]=C.td6AddChoice(state,1,0,0,custom);
 assert.throws(()=>C.td6AddChoice(state,1,0,1,custom),/déjà utilisé/);
});
test('six choix maximum, un par dresseur',()=>{
 const state=make();
 for(let i=0;i<6;i++)state.choices[1]=C.td6AddChoice(state,1,i,0,custom);
 assert.equal(state.choices[1].entries.length,6);
 assert.throws(()=>C.td6AddChoice(state,1,5,1,custom),/six manches/);
});
test('refuser les attaques inconnues ou répétées, les natures et téras invalides',()=>{
 const state=make();
 for(const changes of [{moves:['tackle','tackle','protect','rest']},{moves:['tackle','growl','protect','hyper-beam']},{moves:['tackle']},{nature:'Inconnue'},{tera:'inconnu'}]){
  assert.throws(()=>C.td6AddChoice(state,1,0,0,{...custom,...changes}));
 }
});
test('refuser un ancien état de partie et les offres inexistantes',()=>{
 const state=make();
 state.choices[1].gameId='ancienne-partie';
 assert.throws(()=>C.td6AddChoice(state,1,0,0,custom),/Partie modifiée/);
 state.choices[1].gameId=state.gameId;
 assert.throws(()=>C.td6AddChoice(state,1,6,0,custom),/inconnue/);
});
test('le tirage évite la signature précédente quand un autre tirage est disponible',()=>{
 const previous=make();
 const next=C.td6Create(Array.from({length:40},(_,i)=>offer(i+1)),previous);
 assert.notEqual(next.signature,previous.signature);
});
test('le mode est branché au DOM, à la synchronisation et aux règles Firebase',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const ui=readFileSync(new URL('../data/trainer-draft-six.js',import.meta.url),'utf8');
 const rules=JSON.parse(readFileSync(new URL('../firebase.database.rules.json',import.meta.url),'utf8'));
 assert.match(html,/option value="trainerdraft6">/);
 assert.match(html,/id="trainerDraftPanel"/);
 assert.match(html,/TrainerDraft6\.receive\(r\.trainerDraft6/);
 assert.match(html,/data\/trainer-draft-six\.js/);
 assert.match(ui,/child\('trainerDraft6\/choices\/'\+seat\)/);
 assert.match(ui,/version_group\?\.name==='scarlet-violet'/);
 assert.match(ui,/trainerMarketEligible\('sv',false\)/);
 assert.ok(rules.rules.rooms['$room'].trainerDraft6.choices['$seat']['.write']);
 assert.ok(rules.rules.rooms['$room'].trainerMarket['.write']);
});

test('scripts analysables par Node et aucun dessin-rébus réactivé',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../data/trainer-draft-six.js',import.meta.url),'utf8');
 new Script(js,{filename:'trainer-draft-six.js'});
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
 for(const [i,source] of scripts.entries())new Script(source,{filename:'index-inline-'+i+'.js'});
 assert.match(html,/function phoneticRebus\(p\)/);
 assert.doesNotMatch(html,/REBUS_ILLUSTRATED_FR|rebusIllustration\(/);
});

test('Firebase peut omettre les tableaux vides sans bloquer le premier choix',()=>{
 const state=make();
 delete state.choices[1].entries;
 const next=C.td6AddChoice(state,1,0,0,custom);
 assert.equal(next.entries.length,1);
});
