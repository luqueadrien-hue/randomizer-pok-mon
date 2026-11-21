const test=require('node:test'),assert=require('node:assert/strict');
const {createDraft,choose}=require('../data/draft-six-engine.cjs');
const trainers=Array.from({length:8},(_,i)=>({id:'t'+i,name:'Dresseur '+i,games:['sv']}));
const offers=Array.from({length:20},(_,i)=>({id:i+1,formId:'p'+i,games:['sv'],verified:true,legalMoves:['a','b','c','d','e'],initialMoves:['a','b','c','d'],ability:'talent',item:'objet',evs:[252,252,4,0,0,0],ivs:[31,31,31,31,31,31]}));
const build=()=>createDraft({game:'sv',trainers,offers,rng:()=>0.42});
test('six dresseurs et 18 propositions distinctes',()=>{const s=build();assert.equal(new Set(s.trainers.map(t=>t.id)).size,6);assert.equal(new Set(s.trainers.flatMap(t=>t.offers.map(p=>p.formId))).size,18)});
test('mêmes offres pour deux joueurs, dresseur unique par joueur',()=>{let s=build();const t=s.trainers[0],p=t.offers[0],f={formId:p.formId,moves:p.initialMoves,nature:'Rigide',tera:'fire'};s=choose(s,1,t.id,f);s=choose(s,2,t.id,f);assert.equal(s.choices[2].length,1);assert.throws(()=>choose(s,1,t.id,f),/déjà utilisé/)});
test('refuse attaque illégale et absence de tera en SV',()=>{const s=build(),t=s.trainers[0],p=t.offers[0];assert.throws(()=>choose(s,1,t.id,{formId:p.formId,moves:['a','b','c','x'],nature:'Rigide',tera:'fire'}));assert.throws(()=>choose(s,1,t.id,{formId:p.formId,moves:p.initialMoves,nature:'Rigide'}))});
test('refuse catalogue insuffisant ou non vérifié',()=>{assert.throws(()=>createDraft({game:'sv',trainers,offers:offers.slice(0,17)}));assert.throws(()=>createDraft({game:'sv',trainers,offers:offers.map(p=>({...p,verified:false}))}))});
