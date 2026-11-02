// Tests DOM simulé : aucune requête réseau réelle ni Firebase.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const scope={window:{}};
vm.runInNewContext(read('data/encyclopedie-index.js'),scope);
class FakeElement{
 constructor(id){this.id=id;this.value=id==='kind'?'pokemon':id==='game'?'scarlet-violet':'';this.innerHTML='';this.textContent='';this.dataset={};this.listeners={};this.options=[{text:'Écarlate / Violet'}];this.selectedIndex=0;this.classList={add(){},remove(){},toggle(){}}}
 addEventListener(name,fn){this.listeners[name]=fn}
 appendChild(){}replaceChildren(){}scrollIntoView(){}
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('grille française, recherche, filtre type, objets et fiche en DOM simulé',async()=>{
 const els={};
 const document={getElementById:id=>(els[id]??=new FakeElement(id)),createElement:()=>new FakeElement('option'),querySelectorAll:()=>[]};
 const fetch=async url=>{
  let body;
  if(url.includes('pokemon-species?'))body={results:[{name:'bulbasaur',url:'https://pokeapi.co/api/v2/pokemon-species/1/'},{name:'pikachu',url:'https://pokeapi.co/api/v2/pokemon-species/25/'}]};
  else if(url.endsWith('/type/grass'))body={pokemon:[{pokemon:{name:'bulbasaur'}}]};
  else if(url.includes('/item?'))body={results:[{name:'leftovers',url:'https://pokeapi.co/api/v2/item/leftovers/'}]};
  else if(url.includes('item-category?'))body={results:[]};
  else if(url.endsWith('/item/leftovers'))body={name:'leftovers',names:[{language:{name:'fr'},name:'Restes'}],category:{name:'held-items'},cost:100,effect_entries:[{language:{name:'fr'},effect:'Restaure des PV à chaque tour.'}],sprites:{default:null}};
  else throw Error('URL non simulée : '+url);
  return {ok:true,json:async()=>body};
 };
 new Function('window','document','fetch',read('data/portail.js'))(scope.window,document,fetch);
 await tick();await tick();
 assert.match(els.cards.innerHTML,/Bulbizarre/);
 assert.match(els.cards.innerHTML,/Pikachu/);
 els.search.value='Pikachu';els.search.listeners.input();
 assert.match(els.cards.innerHTML,/Pikachu/);assert.doesNotMatch(els.cards.innerHTML,/Bulbizarre/);
 els.search.value='';els.search.listeners.input();
 els.type.value='grass';await els.type.listeners.change();await tick();
 assert.match(els.cards.innerHTML,/Bulbizarre/);assert.doesNotMatch(els.cards.innerHTML,/Pikachu/);
 els.kind.value='item';await els.kind.listeners.change();await tick();
 assert.match(els.cards.innerHTML,/Restes/);
 await els.cards.listeners.click({target:{closest:()=>({dataset:{slug:'leftovers',kind:'item'}})}});
 await tick();await tick();
 assert.match(els.detail.innerHTML,/Restaure des PV/);
});
