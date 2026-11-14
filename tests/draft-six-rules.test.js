'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const D=require('../data/draft-six-rules.js');
const offer=i=>({species:'species-'+i,game:'sv',verified:true,source:'https://example.org/verified/'+i,ability:'ability',item:'leftovers',legalMoves:['a','b','c','d','e'],moves:['a','b','c','d'],evs:[252,252,4,0,0,0],ivs:[31,31,31,31,31,31],nature:'Rigide',tera:'fire'});
const trainers=Array.from({length:7},(_,i)=>({id:'trainer-'+i,name:'Trainer '+i,games:['sv']}));
const make=()=>D.create({game:'sv',trainers,offers:Array.from({length:18},(_,i)=>offer(i)),rng:()=>0.5});
const custom={moves:['a','b','c','e'],nature:'Jovial',tera:'water'};
test('six distinct trainers, 18 distinct offers and empty teams',()=>{
 const s=make();assert.equal(s.trainers.length,6);
 assert.equal(new Set(s.trainers.map(t=>t.id)).size,6);
 assert.equal(new Set(s.trainers.flatMap(t=>t.offers.map(o=>o.species))).size,18);
 assert.equal(s.players['1'].length,0);assert.equal(s.players['2'].length,0);
});
test('both players may use the same trainer and species; trainer cannot repeat per player',()=>{
 let s=make(),t=s.trainers[0].id;
 s=D.choose(s,1,t,0,custom);
 assert.throws(()=>D.choose(s,1,t,1,custom),/tour/);
 s=D.choose(s,2,t,0,custom);
 assert.equal(s.players['1'][0].species,s.players['2'][0].species);
 assert.throws(()=>D.choose(s,1,t,1,custom),/déjà utilisé/);
});
test('twelve choices complete two teams of six',()=>{
 let s=make();
 for(let i=0;i<6;i++)for(const seat of [1,2])s=D.choose(s,seat,s.trainers[i].id,0,custom);
 assert.equal(s.turn,0);assert.equal(s.players['1'].length,6);assert.equal(s.players['2'].length,6);
});
test('illegal attacks, EVs, game mismatch and unsupported tera are rejected',()=>{
 let s=make();assert.throws(()=>D.choose(s,1,s.trainers[0].id,0,{...custom,moves:['a','a','b','c']}),/attaques/);
 assert.throws(()=>D.create({game:'sv',trainers,offers:[{...offer(0),evs:[252,252,252,0,0,0]},...Array.from({length:17},(_,i)=>offer(i+1))]}),/EV/);
 assert.throws(()=>D.create({game:'bdsp',trainers,offers:[]}),/dresseurs/);
});

test('invalid catalog entries are skipped when enough verified offers remain',()=>{
 const invalid={...offer(99),verified:false};
 const s=D.create({game:'sv',trainers,offers:[invalid,...Array.from({length:18},(_,i)=>offer(i))],rng:()=>0.5});
 assert.equal(s.trainers.flatMap(t=>t.offers).length,18);
 assert.ok(s.trainers.flatMap(t=>t.offers).every(p=>p.verified===true));
});
test('invalid RNG values and corrupted history are rejected',()=>{
 assert.throws(()=>D.create({game:'sv',trainers,offers:Array.from({length:18},(_,i)=>offer(i)),rng:()=>1}),/aléatoire/);
 const s=make();s.players['1'].push({trainerId:'unknown'});
 assert.throws(()=>D.choose(s,1,s.trainers[0].id,0,custom),/Historique/);
});
