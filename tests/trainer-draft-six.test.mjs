import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const require=createRequire(import.meta.url);
const C=require('../data/trainer-draft-core.js');
const makeOffer=id=>({id,name:'Pokémon '+id,legalMoves:['tackle','growl','protect','rest','quick-attack'],initialMoves:['tackle','growl','protect','rest'],nature:'Hardi',tera:'normal'});
const candidates=Array.from(new Set(C.TD6_LORE.map(x=>x.id))).map(makeOffer);
const build=(mode='shared')=>{
 const state=C.td6Create(candidates,null,Math.random,'sv',30,mode);
 state.gameId='test-game';state.choices[1].gameId=state.gameId;state.choices[2].gameId=state.gameId;return state;
};
const custom={moves:['tackle','growl','protect','rest'],nature:'Hardi',tera:'normal'};
test('boîte PC de 5 lignes et 6 colonnes avec les cinq tarifs',()=>{
 const s=build();
 assert.equal(s.boxes[1].length,5);
 assert.deepEqual(s.boxes[1].map(r=>r.pokemon.length),[6,6,6,6,6]);
 assert.deepEqual(s.boxes[1].map(r=>r.price),[15,10,5,2,1]);
 assert.equal(s.budget,30);
 assert.equal(new Set(s.boxes[1].flatMap(r=>r.pokemon.map(p=>p.id))).size,30);
});
test('boîte commune identique et achat exclusif',()=>{
 const s=build();
 assert.deepEqual(s.boxes[1],s.boxes[2]);
 s.choices[1]=C.td6AddChoice(s,1,4,0,custom);
 assert.throws(()=>C.td6AddChoice(s,2,4,0,custom),/déjà acheté/);
});
test('boîtes séparées, achats indépendants',()=>{
 const s=build('separate');
 assert.equal(s.boxes[1].length,5);assert.equal(s.boxes[2].length,5);
 s.choices[1]=C.td6AddChoice(s,1,4,0,custom);
 s.choices[2]=C.td6AddChoice(s,2,4,0,custom);
 assert.equal(s.choices[1].entries.length,1);
 assert.equal(s.choices[2].entries.length,1);
});
test('six achats maximum et budget respecté',()=>{
 const s=build();
 for(let i=0;i<6;i++)s.choices[1]=C.td6AddChoice(s,1,4,i,custom);
 assert.equal(s.choices[1].entries.length,6);
 assert.throws(()=>C.td6AddChoice(s,1,3,0,custom),/six Pokémon/);
 const low=build();low.budget=1;
 assert.throws(()=>C.td6AddChoice(low,1,0,0,custom),/Budget insuffisant/);
});
test('attaques, nature et type Téra validés',()=>{
 const s=build();
 for(const changes of [{moves:['tackle','tackle','protect','rest']},{moves:['tackle','growl','protect','fake-move']},{nature:'Inconnue'},{tera:'inconnu'}])
  assert.throws(()=>C.td6AddChoice(s,1,4,0,{...custom,...changes}));
});
test('HTML, scripts et règles Firebase compatibles avec le mode actuel',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const ui=readFileSync(new URL('../data/trainer-draft-six.js',import.meta.url),'utf8');
 const wheel=readFileSync(new URL('../data/zone-wheel.js',import.meta.url),'utf8');
 const rules=JSON.parse(readFileSync(new URL('../firebase.database.rules.json',import.meta.url),'utf8'));
 assert.match(html,/id="trainerDraftBudget"[^>]*value="30"/);
 assert.match(html,/id="trainerDraftBoxMode"/);
 assert.match(html,/repeat\(6,minmax\(0,1fr\)\)/);
 assert.doesNotMatch(html,/Essayer solo/i);
 assert.match(ui,/child\('trainerDraft6'\)/);
 assert.match(wheel,/GAME_ZONES/);
 assert.match(wheel,/version:3/);
 assert.match(rules.rules.rooms['$room'].trainerDraft6['.validate'],/version'\)\.val\(\) === 2/);
 assert.match(rules.rules.rooms['$room'].zoneWheel['.validate'],/version'\)\.val\(\) === 3/);
 new Script(ui);new Script(wheel);
});
