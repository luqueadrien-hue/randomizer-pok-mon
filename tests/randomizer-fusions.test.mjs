import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script,runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const inline=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(Boolean);
function section(start,end){
 const i=html.indexOf(start),j=html.indexOf(end,i);
 assert.ok(i>=0&&j>i,'Missing source section: '+start);
 return html.slice(i,j);
}
test('all inline scripts parse',()=>{
 assert.ok(inline.length>=1);
 for(const source of inline)assert.doesNotThrow(()=>new Script(source));
});
test('49 numbered modes, unique and stable IDs',()=>{
 const entries=[...html.matchAll(/<option value="([^"]+)">(\d+)\.\s*([^<]+)<\/option>/g)];
 assert.equal(entries.length,49);
 assert.equal(new Set(entries.map(m=>m[1])).size,entries.length);
 for(const n of [18,31,32,34,46,47,48,52])assert.ok(!entries.some(m=>Number(m[2])===n),'Removed '+n);
 for(const n of [6,8,13,14,15,20,22,27,29,30,33,38,40,45,49,50])assert.ok(entries.some(m=>Number(m[2])===n),'Preserved '+n);
 assert.ok(!html.includes('<option value="vgc">'));
});
test('highest stat normal/hard and ties',()=>{
 let difficulty='normal';
 const document={getElementById:()=>({value:difficulty})};
 const fn=runInNewContext(section('function extremeStatClue(p,high=true)','// Tiers Smogon')+';extremeStatClue',{document});
 const p={stats:{hp:100,attack:110,defense:110,'special-attack':80,'special-defense':60,speed:90}};
 assert.equal(fn(p,true),'Attaque / Défense : 110 — ex æquo');
 difficulty='hard';
 assert.equal(fn(p,true),'Attaque / Défense — ex æquo');
 assert.equal(fn(p,false),'Défense Spé. : 60');
});
test('morphology does not leak size, weight or color',()=>{
 const fn=runInNewContext(section('function morphologyClue(p)','const REAL_JOB_BY_TYPE')+';morphologyClue',{MORPHOLOGY_FR:{quadruped:'Quadrupède'}});
 const result=fn({shape:'quadruped',height:25,weight:60,color:'red',hasGenderDifferences:true});
 assert.match(result,/Quadrupède/);
 assert.doesNotMatch(result,/taille|poids|couleur|rouge/i);
});
test('clean Pokédex description rejects scraped URLs',()=>{
 const fn=runInNewContext(section('function cleanDexEntry(raw)','async function getDexDescriptions')+';cleanDexEntry');
 assert.equal(fn('https://www.pokepedia.fr/Pok%C3%A9mon'),'');
 assert.equal(fn('Il vit dans les montagnes.'),'Il vit dans les montagnes.');
});
test('rōmaji transcription examples',()=>{
 const source=section('const KANA_HEPBURN={};','async function japaneseNameClue');
 const fn=runInNewContext(source+';kanaToRomaji');
 for(const [a,b] of [['ニャオニクス','Nyaonikusu'],['ドロンチ','Doronchi'],['スリーパー','Surīpā'],['ピカチュウ','Pikachū'],['ポケモン','Pokemon']])assert.equal(fn(a),b);
});
test('merged mode settings are synchronized in room snapshots',()=>{
 for(const id of ['evolutionMergedStyle','abilityMergedStyle','habitatMergedStyle','statHighestMergedStyle']){
  assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(html,new RegExp(id+':document\\.getElementById'));
 }
 for(const [oldName,newName] of [['evomethod','evolution'],['hiddenability','ability'],['realhabitat','habitat'],['dominantstat','stat-highest']]){
  assert.match(html,new RegExp(oldName+":'"+newName+"'"));
 }
});
test('one audio control per card, responsive styling',()=>{
 assert.match(html,/class="pokemonZoneAudio"/);
 assert.match(html,/audio\.pokemonZoneAudio\{display:block;width:100%/);
 assert.doesNotMatch(html,/if\(!audio\)audio=await musicPreview\(\['Pokemon soundtrack'/);
});

test('three verified Scarlet/Violet encounters are labeled and sourced',()=>{
 const src=section('const SV_VERIFIED_WILD=','async function encounterInfo(p){');
 const get=runInNewContext(src+';verifiedSVEncounter');
 for(const id of [595,185,398]){
  const row=get({id});
  assert.ok(row.verified);
  assert.ok(row.details.length>=3);
  assert.ok(row.details.every(x=>x.includes('Pokémon Écarlate/Violet')));
  assert.match(row.source,/^https:\/\/www\.pokepedia\.fr\//);
 }
 assert.equal(get({id:999}),null);
 assert.match(html,/SWITCH_ENCOUNTER_VERSIONS\.has\(vd\.version\?\.name\)/);
});
