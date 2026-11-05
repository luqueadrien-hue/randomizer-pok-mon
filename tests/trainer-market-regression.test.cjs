'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../data/trainer-draft-core.js');
const candidates=[...new Set(Core.TD6_LORE.map(x=>x.id))].map(id=>({id,name:'Pokémon n°'+id,img:'',legalMoves:['a','b','c','d'],initialMoves:['a','b','c','d'],nature:'Hardi',tera:'normal'}));
for(const mode of ['shared','separate'])test('Marché & Draft : boîte '+mode+' 5 x 6, tarifs et budget',()=>{
 const state=Core.td6Create(candidates,null,Math.random,'sv',30,mode);
 state.gameId='test';state.choices[1].gameId='test';state.choices[2].gameId='test';
 assert.equal(state.boxes[1].length,5);
 assert.deepEqual(state.boxes[1].map(r=>r.pokemon.length),[6,6,6,6,6]);
 assert.deepEqual(state.boxes[1].map(r=>r.price),[15,10,5,2,1]);
 assert.equal(state.budget,30);
 if(mode==='shared')assert.deepEqual(state.boxes[1],state.boxes[2]);
 const custom={moves:['a','b','c','d'],nature:'Hardi',tera:'normal'};
 state.choices[1]=Core.td6AddChoice(state,1,0,0,custom);
 assert.equal(state.choices[1].entries.length,1);
 assert.throws(()=>Core.td6AddChoice(state,1,0,0,custom),/déjà choisi/);
 if(mode==='shared')assert.throws(()=>Core.td6AddChoice(state,2,0,0,custom),/déjà acheté/);
});
test('Marché & Draft : limite de six Pokémon et budget',()=>{
 const state=Core.td6Create(candidates,null,Math.random,'sv',6,'shared');
 state.gameId='test';state.choices[1].gameId='test';state.choices[2].gameId='test';
 const custom={moves:['a','b','c','d'],nature:'Hardi',tera:'normal'};
 assert.throws(()=>Core.td6AddChoice(state,1,0,0,custom),/Budget insuffisant/);
 for(let i=0;i<6;i++)state.choices[1]=Core.td6AddChoice(state,1,4,i,custom);
 assert.equal(state.choices[1].entries.length,6);
 assert.throws(()=>Core.td6AddChoice(state,1,3,0,custom),/déjà complète/);
});

// Le libellé français ne doit pas remplacer la valeur interne attendue par le moteur.
test('Marché & Draft : les types Téra français conservent leur valeur canonique',()=>{
 const fs=require('node:fs');
 const ui=fs.readFileSync(require('node:path').join(__dirname,'../data/trainer-draft-six.js'),'utf8');
 assert.match(ui,/\x27<option value="\x27\+esc\(n\)/);
 assert.match(ui,/esc\(typeFr\[n\]\|\|n\)/);
 const state=Core.td6Create(candidates,null,Math.random,'sv',30,'shared');
 state.gameId='test';state.choices[1].gameId='test';state.choices[2].gameId='test';
 const entry=Core.td6AddChoice(state,1,4,0,{moves:['a','b','c','d'],nature:'Hardi',tera:'fire'});
 assert.equal(entry.entries[0].tera,'fire');
});
