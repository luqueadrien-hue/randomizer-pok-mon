/* Portail Pokémon : navigateur visuel et fiches alimentées par PokéAPI.
   Pas de prétention à un index français exhaustif ni à une compatibilité HOME complète. */
(function(){
'use strict';
const API='https://pokeapi.co/api/v2/';
const ART='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
const SPR='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
const ITEM_SPR='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/';
const ranges={1:[1,151],2:[152,251],3:[252,386],4:[387,493],5:[494,649],6:[650,721],7:[722,809],8:[810,905],9:[906,1025]};
const types={normal:'Normal',fire:'Feu',water:'Eau',electric:'Électrik',grass:'Plante',ice:'Glace',fighting:'Combat',poison:'Poison',ground:'Sol',flying:'Vol',psychic:'Psy',bug:'Insecte',rock:'Roche',ghost:'Spectre',dragon:'Dragon',dark:'Ténèbres',steel:'Acier',fairy:'Fée'};
const stats={'hp':'PV',attack:'Attaque',defense:'Défense','special-attack':'Att. Spé.','special-defense':'Déf. Spé.',speed:'Vitesse'};
const egg={'monster':'Monstrueux',water1:'Aquatique 1','water-1':'Aquatique 1','water-2':'Aquatique 2','water-3':'Aquatique 3',bug:'Insectoïde',flying:'Aérien',field:'Terrestre',fairy:'Féerique',grass:'Végétal','human-like':'Humanoïde',mineral:'Minéral','amorphous':'Amorphe',ditto:'Métamorph','dragon':'Draconique','no-eggs':'Inconnu'};
const itemFR={'leftovers':'Restes','life-orb':'Orbe Vie','choice-scarf':'Mouchoir Choix','choice-band':'Bandeau Choix','choice-specs':'Lunettes Choix','focus-sash':'Ceinture Force','assault-vest':'Veste de Combat','sitrus-berry':'Baie Sitrus','eviolite':'Évoluroc','light-clay':'Lumargile','rocky-helmet':'Casque Brut','heavy-duty-boots':'Grosses Bottes','expert-belt':'Ceinture Pro','weakness-policy':'Vulné-Assurance','ability-patch':'Patch Talent','ability-capsule':'Pilule Talent'};
const $=id=>document.getElementById(id);
const escapeHTML=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'').trim();
const frRows=Array.isArray(window.POKE_FR_MARKET_INDEX)?window.POKE_FR_MARKET_INDEX:[];
const frBase=new Map(),forms=[];
frRows.forEach(row=>{const id=Number(row[0]),name=row[1],form=row[2]||'';if(!Number.isInteger(id))return;if(form)forms.push({id,name,slug:form,form:true});else if(!frBase.has(id))frBase.set(id,name)});
const cache=new Map();
async function api(path){if(cache.has(path))return cache.get(path);const promise=fetch(API+path).then(r=>{if(!r.ok)throw Error('Données indisponibles ('+r.status+')');return r.json()});cache.set(path,promise);try{return await promise}catch(e){cache.delete(path);throw e}}
function frName(d){return (d.names||[]).find(x=>x.language?.name==='fr')?.name||d.name||'Sans nom'}
function frEffect(d){return (d.effect_entries||[]).find(x=>x.language?.name==='fr')?.effect||(d.flavor_text_entries||[]).find(x=>x.language?.name==='fr')?.text||'Description française indisponible dans la source.'}
function label(slug){return String(slug||'').replace(/-/g,' ')}
function status(msg,error=false){$('status').textContent=msg;$('status').classList.toggle('error',error)}
let species=[],resource=[],filtered=[],shown=36,selectedType=null,selectionToken=0,detailOpen=false;
const kindEl=$('kind'),searchEl=$('search'),genEl=$('generation'),typeEl=$('type'),gameEl=$('game'),catEl=$('category');
Object.entries(types).forEach(([key,value])=>{const opt=document.createElement('option');opt.value=key;opt.textContent=value;typeEl.appendChild(opt)});
function picture(p){return p.form?'':ART+p.id+'.png'}
function thumb(p){
 if(p.form)return '<div class="placeholder" aria-hidden="true">🔄</div>';
 if(p.kind==='pokemon')return '<img loading="lazy" alt="" src="'+ART+p.id+'.png" onerror="this.onerror=null;this.src=\''+SPR+p.id+'.png\'">';
 if(p.kind==='item')return '<img loading="lazy" alt="" src="'+ITEM_SPR+encodeURIComponent(p.slug)+'.png" onerror="this.style.display=\'none\'">';
 return '<div class="placeholder" aria-hidden="true">'+(p.kind==='ability'?'✨':'⚡')+'</div>';
}
function populateSuggestions(list){const box=$('suggestions');box.replaceChildren();list.slice(0,50).forEach(p=>{const opt=document.createElement('option');opt.value=p.name;box.appendChild(opt)})}
function apply(){
 const q=normalize(searchEl.value),g=genEl.value,k=kindEl.value;
 let list=k==='pokemon'?species.concat(forms.map(x=>({...x,kind:'pokemon'}))):resource;
 if(k==='pokemon'){
  if(g){const [lo,hi]=ranges[g];list=list.filter(x=>x.id>=lo&&x.id<=hi)}
  if(selectedType)list=list.filter(x=>selectedType.has(x.form?x.slug:x.slug||String(x.id)));
 }else if(k==='item'&&catEl.value){list=list.filter(x=>x.category===catEl.value)}
 filtered=list.filter(p=>!q||normalize(p.name).includes(q)||normalize(p.slug).includes(q)||String(p.id||'').includes(q));
 shown=36;detailOpen=false;$('detail').classList.add('hide');$('back').classList.add('hide');$('cards').classList.remove('hide');render();
}
function render(){
 const list=filtered.slice(0,shown);
 $('cards').innerHTML=list.map(p=>'<button class="poke-card" type="button" data-slug="'+escapeHTML(p.slug)+'" data-kind="'+escapeHTML(p.kind)+'" aria-label="Ouvrir la fiche de '+escapeHTML(p.name)+'">'+thumb(p)+'<small>'+(p.id?'N° '+String(p.id).padStart(4,'0'):'')+(p.form?' · Forme':'')+'</small><strong>'+escapeHTML(p.name)+'</strong></button>').join('');
 $('more').classList.toggle('hide',filtered.length<=shown);
 status(filtered.length+' résultat(s) · '+list.length+' affiché(s).');
 populateSuggestions(filtered);
}
function showDetail(html){$('detail').innerHTML=html;$('detail').classList.remove('hide');$('cards').classList.add('hide');$('more').classList.add('hide');$('back').classList.remove('hide');detailOpen=true;$('detail').scrollIntoView({behavior:'smooth',block:'start'});}
function detailHeading(name,sub,img){return '<div class="detail-head">'+(img?'<img alt="'+escapeHTML(name)+'" src="'+escapeHTML(img)+'" onerror="this.style.display=\'none\'">':'')+'<div><h2>'+escapeHTML(name)+'</h2><p class="muted">'+escapeHTML(sub)+'</p></div></div>'}
function statBlock(p){return '<div class="stats">'+p.stats.map(s=>'<div class="stat">'+escapeHTML(stats[s.stat.name]||s.stat.name)+'<b>'+s.base_stat+'</b></div>').join('')+'</div>'}
function evoNodes(node,out){if(!node)return;out.push({name:node.species.name,details:node.evolution_details||[]});(node.evolves_to||[]).forEach(n=>evoNodes(n,out))}
function evoDescription(details){if(!details.length)return 'Forme de départ';const d=details[0],parts=[];if(d.min_level)parts.push('niveau '+d.min_level);if(d.item)parts.push('objet : '+label(d.item.name));if(d.held_item)parts.push('objet tenu : '+label(d.held_item.name));if(d.min_happiness)parts.push('bonheur ≥ '+d.min_happiness);if(d.time_of_day)parts.push('moment : '+d.time_of_day);if(d.known_move)parts.push('capacité : '+label(d.known_move.name));if(d.location)parts.push('lieu particulier');if(d.trigger?.name==='trade')parts.unshift('échange');if(!parts.length)parts.push('condition spéciale à vérifier');return parts.join(' · ')}
async function pokemonDetail(entry,token){
 const p=await api('pokemon/'+encodeURIComponent(entry.form?entry.slug:entry.id));
 const s=await api('pokemon-species/'+entry.id);
 if(token!==selectionToken)return;
 const name=entry.form?entry.name:frName(s),typeNames=p.types.map(x=>types[x.type.name]||x.type.name).join(' / ');
 const ab=await Promise.all(p.abilities.map(async x=>{try{const d=await api('ability/'+x.ability.name);return frName(d)+(x.is_hidden?' (caché)':'')}catch{return label(x.ability.name)+(x.is_hidden?' (caché)':'')}}));
 if(token!==selectionToken)return;
 let evolution='<p>Chaîne d’évolution indisponible.</p>';
 if(s.evolution_chain?.url){try{const id=s.evolution_chain.url.split('/').filter(Boolean).pop();const chain=await api('evolution-chain/'+id),nodes=[];evoNodes(chain.chain,nodes);const names=await Promise.all(nodes.map(async n=>{try{return frName(await api('pokemon-species/'+n.name))}catch{return label(n.name)}}));evolution='<div class="data-list">'+nodes.map((n,i)=>'<span>'+escapeHTML(names[i])+' — '+escapeHTML(evoDescription(n.details))+'</span>').join('')+'</div>'}catch{}}
 const game=gameEl.value,learned=p.moves.filter(x=>x.version_group_details.some(v=>v.version_group.name===game));
 const moves=learned.slice(0,24);
 const moveNames=await Promise.all(moves.map(async x=>{try{return frName(await api('move/'+x.move.name))}catch{return label(x.move.name)}}));
 if(token!==selectionToken)return;
 const abilityTags=ab.map(x=>'<span>'+escapeHTML(x)+'</span>').join('');
 const moveTags=moves.map((x,i)=>'<span>'+escapeHTML(moveNames[i])+'</span>').join('');
 const height=p.height/10,weight=p.weight/10,eggGroups=(s.egg_groups||[]).map(x=>egg[x.name]||label(x.name));
 const total=p.stats.reduce((n,x)=>n+x.base_stat,0);
 const description=(s.flavor_text_entries||[]).find(x=>x.language.name==='fr')?.flavor_text?.replace(/[\f\n\r]+/g,' ')||'';
 const img=p.sprites.other?.['official-artwork']?.front_default||p.sprites.front_default||'';
 showDetail('<article class="detail">'+detailHeading(name,'N° '+String(entry.id).padStart(4,'0')+' · '+typeNames,img)+
 '<p>'+escapeHTML(description)+'</p><p>Taille : '+height+' m · Poids : '+weight+' kg · Total des statistiques : <b>'+total+'</b></p>'+
 '<h3>Statistiques de base</h3>'+statBlock(p)+
 '<h3>Talents</h3><div class="data-list">'+abilityTags+'</div>'+
 '<h3>Évolutions et conditions</h3>'+evolution+
 '<h3>Reproduction</h3><p>Groupes d’Œufs : '+escapeHTML(eggGroups.join(' / ')||'Non renseignés')+'.</p>'+
 '<h3>Capacités — '+escapeHTML(gameEl.options[gameEl.selectedIndex].text)+'</h3><p>'+learned.length+' capacité(s) référencée(s) dans les données de version du Pokémon. '+(learned.length>24?'24 premières affichées.':'')+' Cette liste ne prouve pas à elle seule la transférabilité du Pokémon via HOME.</p><div class="data-list">'+(moveTags||'<span>Aucune capacité référencée pour cette version.</span>')+'</div>'+
 '<p><a href="index.html?outil=strategy">Fiche stratégique et formats VGC/Smogon</a> · <a href="index.html?outil=damage">Calculateur de dégâts</a></p></article>');
}
async function resourceDetail(entry,token){
 const d=await api(entry.kind+'/'+encodeURIComponent(entry.slug));if(token!==selectionToken)return;
 const name=frName(d),img=entry.kind==='item'?d.sprites?.default||'':'';
 let info='';
 if(entry.kind==='item'){info='<p>Catégorie : '+escapeHTML(label(d.category?.name))+' · Coût dans les jeux : '+escapeHTML(d.cost)+'</p><h3>Effet</h3><p>'+escapeHTML(frEffect(d))+'</p>'}
 if(entry.kind==='ability'){info='<h3>Effet du talent</h3><p>'+escapeHTML(frEffect(d))+'</p><p>Pokémon référencés : '+(d.pokemon?.length||0)+' (formes et générations confondues).</p>'}
 if(entry.kind==='move'){info='<p>Type : '+escapeHTML(types[d.type?.name]||d.type?.name)+' · Catégorie : '+escapeHTML(({physical:'Physique',special:'Spéciale',status:'Statut'})[d.damage_class?.name]||'Inconnue')+' · Puissance : '+(d.power??'—')+' · Précision : '+(d.accuracy??'—')+' · PP : '+(d.pp??'—')+'</p><h3>Effet</h3><p>'+escapeHTML(frEffect(d))+'</p>'}
 showDetail('<article class="detail">'+detailHeading(name,entry.kind==='item'?'Objet':entry.kind==='ability'?'Talent':'Capacité',img)+info+'<p class="muted">Source : PokéAPI. Les traductions et détails peuvent être incomplets.</p></article>');
}
async function openEntry(entry){
 const token=++selectionToken;status('Chargement de la fiche…');$('cards').classList.add('hide');$('more').classList.add('hide');
 try{if(entry.kind==='pokemon')await pokemonDetail(entry,token);else await resourceDetail(entry,token);if(token===selectionToken)status('Fiche chargée.')}
 catch(e){if(token!==selectionToken)return;$('cards').classList.remove('hide');status('Impossible de charger cette fiche : '+e.message,true)}
}
async function loadKind(){
 const k=kindEl.value,token=++selectionToken;resource=[];selectedType=null;typeEl.value='';
 genEl.disabled=k!=='pokemon';typeEl.disabled=k!=='pokemon';
 $('categoryWrap').classList.toggle('hide',k!=='item');
 if(k==='pokemon'){apply();return}
 status('Chargement de '+(k==='item'?'objets':k==='ability'?'talents':'capacités')+'…');
 try{
  const d=await api(k+'?limit='+(k==='item'?2500:k==='move'?1000:400));
  if(token!==selectionToken)return;
  resource=d.results.map(x=>({kind:k,slug:x.name,name:k==='item'?itemFR[x.name]||label(x.name):label(x.name),category:''}));
  if(k==='item'){
   try{const cats=await api('item-category?limit=100');catEl.innerHTML='<option value="">Toutes</option>'+cats.results.map(x=>'<option value="'+escapeHTML(x.name)+'">'+escapeHTML(label(x.name))+'</option>').join('')}catch{}
  }
  apply();
 }catch(e){status('Catalogue inaccessible : '+e.message,true);$('cards').innerHTML=''}
}
async function changeCategory(){
 if(kindEl.value!=='item')return;
 const category=catEl.value;
 if(!category){await loadKind();return}
 status('Filtrage des objets…');
 try{const d=await api('item-category/'+category);resource=(d.items||[]).map(x=>({kind:'item',slug:x.name,name:itemFR[x.name]||label(x.name),category}));apply()}catch(e){status('Catégorie indisponible : '+e.message,true)}
}
async function changeType(){
 if(!typeEl.value){selectedType=null;apply();return}
 status('Chargement du type '+types[typeEl.value]+'…');
 try{const type=typeEl.value,d=await api('type/'+type);if(type!==typeEl.value)return;selectedType=new Set((d.pokemon||[]).map(x=>x.pokemon.name));apply()}catch(e){status('Type indisponible : '+e.message,true)}
}
$('cards').addEventListener('click',e=>{const b=e.target.closest('button[data-slug]');if(!b)return;const entry=filtered.find(x=>x.slug===b.dataset.slug&&x.kind===b.dataset.kind);if(entry)openEntry(entry)});
$('back').addEventListener('click',()=>{++selectionToken;detailOpen=false;$('detail').classList.add('hide');$('back').classList.add('hide');$('cards').classList.remove('hide');render()});
$('more').addEventListener('click',()=>{shown+=36;render()});
searchEl.addEventListener('input',apply);genEl.addEventListener('change',apply);kindEl.addEventListener('change',loadKind);typeEl.addEventListener('change',changeType);catEl.addEventListener('change',changeCategory);
gameEl.addEventListener('change',()=>{if(detailOpen){const b=$('back');b.click();status('Jeu modifié : rouvre une fiche pour voir les capacités correspondantes.')}});
document.querySelectorAll('[data-section]').forEach(a=>a.addEventListener('click',()=>{kindEl.value=a.dataset.section;loadKind()}));
async function init(){
 species=frRows.filter(x=>!x[2]).map(x=>({id:Number(x[0]),slug:String(x[0]),name:x[1],kind:'pokemon'}));
 try{const d=await api('pokemon-species?limit=1025');const byId=new Map(species.map(x=>[x.id,x]));d.results.forEach(x=>{const id=Number(x.url.split('/').filter(Boolean).pop());if(id>=1&&id<=1025){if(byId.has(id))byId.get(id).slug=x.name;else byId.set(id,{id,slug:x.name,name:label(x.name),kind:'pokemon'})}});species=[...byId.values()].sort((a,b)=>a.id-b.id);apply()}
 catch(e){apply();status('PokéAPI inaccessible : affichage limité à '+species.length+' espèces de l’index local. '+e.message,true)}
}
init();
})();