import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function getFunction(name) {
  const line = html.split('\n').find(x => x.startsWith('function ' + name + '('));
  assert.ok(line, 'Fonction absente : ' + name);
  return runInNewContext('(' + line + ')');
}
const numbers = getFunction('moduloNumbers');
const availability = getFunction('moduloAvailability');

test('032 donne les six numéros nationaux distincts (zéro facultatif)', () => {
  assert.deepEqual(Array.from(numbers(32)), [23, 32, 203, 230, 302, 320]);
});
test('pas de doublons ni de numéro national hors plage', () => {
  for (const start of [1, 11, 32, 112, 320, 999, 1025]) {
    const ids = Array.from(numbers(start));
    assert.equal(ids.length, new Set(ids).size);
    assert.ok(ids.every(id => id >= 1 && id <= 1025));
    assert.ok(ids.includes(start));
  }
});
test('les données incomplètes ne rendent aucune proposition éligible', () => {
  assert.equal(availability(23, 'sv', { complete: false, sets: [new Set([23])] }, true), null);
});
test('les transferts HOME incertains sont exclus même si la case est activée', () => {
  const data = { complete: true, sets: [new Set([23, 203])] };
  assert.equal(availability(32, 'sv', data, true), null);
  assert.equal(availability(23, 'sv', data, false)?.state, 'dex');
});
test('Modulo propose toutes les permutations éligibles sans distracteurs', () => {
  assert.match(html, /const chosen=\[\.\.\.round\.eligible\]\.sort/);
  assert.doesNotMatch(html, /const distractors=\[\];for\(let j=0;j<250/);
  assert.match(html, /if\(!data\.complete\)throw Error/);
});
test('les indices de rencontre donnent le jeu et non un lieu ambigu', () => {
  assert.match(html, /if\(m==='capturelocation'\).*?e\.details/);
  assert.match(html, /Lieux de rencontre — par jeu et version/);
});
