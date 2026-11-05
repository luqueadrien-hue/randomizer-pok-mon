'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {td6AddChoice}=require('../data/trainer-draft-core.js');
const offer=id=>({id,legalMoves:['tackle','growl','protect','rest'],initialMoves:['tackle','growl','protect','rest']});
function fixture(boxMode){
 const rows=Array.from({length:5},(_,i)=>({price:1,pokemon:Array.from({length:6},(_,j)=>offer(i*6+j+1))}));
 rows[0].pokemon[0]=offer(25);
 rows[1].pokemon[0]=offer(25);
 return {version:2,game:'sv',gameId:'test-game',budget:30,boxMode,boxes:{1:rows,2:structuredClone(rows)},choices:{1:{gameId:'test-game',entries:[]},2:{gameId:'test-game',entries:[]}}};
}
const form={moves:['tackle','growl','protect','rest'],nature:'Hardi',tera:'normal'};
test('shared market blocks an already purchased species even in another rank',()=>{
 const state=fixture('shared');
 state.choices[1]=td6AddChoice(state,1,0,0,form);
 assert.throws(()=>td6AddChoice(state,2,1,0,form),/Espèce ou forme déjà achetée/);
});
test('separate boxes allow the same species for both players',()=>{
 const state=fixture('separate');
 state.choices[1]=td6AddChoice(state,1,0,0,form);
 assert.equal(td6AddChoice(state,2,1,0,form).entries[0].pokemonId,25);
});
test('shared market still permits a different species',()=>{
 const state=fixture('shared');
 state.choices[1]=td6AddChoice(state,1,0,0,form);
 assert.equal(td6AddChoice(state,2,1,1,form).entries.length,1);
});
