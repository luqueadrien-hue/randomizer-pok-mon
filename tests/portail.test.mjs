// Contrôles hors navigateur : syntaxe, navigation et index partiel de l'encyclopédie.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const home=read('index.html'),portal=read('portail.html'),js=read('data/portail.js');
const scope={window:{}};
vm.runInNewContext(read('data/encyclopedie-index.js'),scope);
const rows=scope.window.POKE_FR_MARKET_INDEX;
test('index local : 362 espèces/formes, dont 12 formes historiques distinctes',()=>{
 assert.equal(rows.length,362);
 assert.equal(rows.filter(r=>r[2]).length,12);
 assert.equal(new Set(rows.map(r=>r[0]+':'+r[2])).size,rows.length);
 assert.ok(rows.every(r=>Number.isInteger(r[0])&&r[0]>=1&&r[0]<=1025&&r[1]));
});
test('le portail charge ses ressources et propose les six rubriques',()=>{
 for(const p of ['data/encyclopedie-index.js','data/portail.js'])assert.ok(portal.includes(p),p);
 for(const x of ['Randomizer','Stratégie','Pokédex','Guides par jeu','Reproduction','Outils'])assert.ok(portal.includes(x),x);
 for(const x of ['id="search"','id="kind"','id="game"','id="type"','id="generation"','id="cards"','id="detail"'])assert.ok(portal.includes(x),x);
});
test('le menu de la racine conserve les salons et lie le portail',()=>{
 assert.ok(home.includes('id="multiplayerPanel"'));
 assert.ok(home.includes('id="accueilPokemon"'));
 assert.ok(home.includes('portail.html#encyclopedie'));
 assert.ok(home.includes("new URLSearchParams(location.search).get('outil')"));
});
test('scripts du portail et du Randomizer : syntaxe valide',()=>{
 assert.doesNotThrow(()=>new Function(js));
 const scripts=[...home.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
 assert.ok(scripts.length>=2);
 scripts.forEach(s=>assert.doesNotThrow(()=>new Function(s)));
});
test('les formes distinctes et le filtrage par jeu ne sont pas présentés comme exhaustifs',()=>{
 assert.ok(portal.includes('l’inventaire de toutes les formes reste à compléter')||portal.includes("l'inventaire de toutes les formes reste à compléter")||portal.includes("l'inventaire de toutes les formes"));
 assert.ok(portal.includes('pas à une certification de compatibilité HOME/DLC'));
});
