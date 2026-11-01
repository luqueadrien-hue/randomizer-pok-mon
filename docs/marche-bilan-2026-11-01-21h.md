# Marché des Dresseurs — bilan du 1er novembre 2026, 21 h

## Résultat effectivement commité

Le Marché des Dresseurs possède **559 occurrences historiques de Pokémon**, contre 250 au précédent bilan : **309 entrées ajoutées** dans `data/trainer-market-expansion.js`. Cela représente **351 identités espèce + forme distinctes** sur l'ensemble du catalogue brut, et **non 559 Pokémon différents ou 559 Pokémon compatibles avec chaque jeu**.

| Rang | Catégorie | Prix fixe | Occurrences historiques |
|---|---|---:|---:|
| 1 | Dresseurs ordinaires | 200 ₽ | 39 |
| 2 | Sbires antagonistes | 350 ₽ | 41 |
| 3 | Champions d'Arène | 500 ₽ | 184 |
| 4 | Rivaux | 650 ₽ | 48 |
| 5 | Professeurs combattants | 700 ₽ | 26 |
| 6 | Admins et chefs antagonistes | 800 ₽ | 51 |
| 7 | Conseil 4 | 1 000 ₽ | 93 |
| 8 | Maîtres, boss ultimes et équivalents | 1 300 ₽ | 77 |
| **Total** | | | **559** |

Les sources historiques couvrent des **exemples des générations I à IX**. La présente mise à jour enrichit surtout HeartGold/SoulSilver (Champions Johto et Kanto, revanches, Conseil 4, Peter, Red, Silver, Team Rocket), le DLC *Le Disque Indigo* (Ligue Myrtille, Kassis et dresseurs du Poste Polaire), les sbires Aqua/Magma/Galaxie/Skull, le Professeur Platane, le Professeur Euphorbe, ainsi que Percupio et son Arcanin de Hisui dans Légendes Pokémon : Arceus.

### Changements de code

- `index.html` charge désormais le fichier d'extension `data/trainer-market-expansion.js` ; les entrées ont des identifiants Firebase normalisés et uniques, avec jeu source, génération et URL de provenance.
- La grille comporte une **recherche par Pokémon, dresseur ou jeu source**, des sections repliables, un nombre d'entrées par rang et des liens vers les sources.
- La création du marché conserve le budget individuel choisi, le jeu cible et l'indication de filtre partiel. Les achats restent atomiques sous `transaction`, exclusifs par espèce **et forme**, et limités à six Pokémon par joueur. Une réinitialisation demande confirmation et ne doit pas écraser silencieusement un achat intervenu entre lecture et transaction.
- Le filtre privilégie les Pokédex de base PokeAPI, consulte les Pokédex DLC s'ils existent, et complète les échecs par les espèces **attestées dans les combats du DLC** déjà présents au catalogue. Il ne prétend pas couvrir toutes les espèces transférables. La liste HOME reste conservatrice et incomplète.
- Les formes régionales documentées sont distinctes (ex. Triopikeur d'Alola, Arcanin de Hisui). Rattata/Rattatac d'Alola sont exclus des quatre destinations actuellement proposées ; la forme normale et la forme régionale ne partagent pas leur stock.
- Vérification supplémentaire de l'UID Firebase courant contre l'identité de session locale ; contrôle des budgets autorisés et rejet d'états d'équipes corrompus. **Ces contrôles côté client ne sécurisent pas la base contre les écritures directes.**

### Vérifications effectuées

**10 tests de logique exécutés et réussis dans un moteur JavaScript V8** sur les fonctions réelles extraites du dépôt : nombres et provenance, unicité des clés, budget, six achats, stock partagé inter-rangs, refus d'un achat simultané concurrent, distinction des formes, filtrage Hisui, repli DLC, refus d'un Pokédex de base absent et réinitialisation. Les scripts inline de `index.html` ont également été compilés sans erreur syntaxique.

Les tests ont été versionnés dans `tests/trainer-market.test.mjs` ; le workflow `.github/workflows/trainer-market-tests.yml` surveille désormais aussi `data/trainer-market-expansion.js`. **L'exécution GitHub Actions / Node 20 n'a pas été confirmée** ; le moteur V8 utilisé pour les simulations n'est pas un navigateur ni un serveur Firebase.

### Ce qui manque avant une version de production

1. **Exhaustivité** : 559 occurrences ne couvrent pas tous les combats, revanches, versions et DLC de Kanto à Paldea. Il manque beaucoup de dresseurs ordinaires, de sbires et de variantes de formes, malgré la présence d'entrées dans les huit rangs.
2. **Compatibilité** : PokéAPI ne fournit pas nécessairement tous les Pokédex DLC demandés. Les listes de repli sont partielles ; les formes et les transferts HOME doivent être vérifiés individuellement. Les quatre destinations actuellement proposées sont SV, Épée/Bouclier, DEPS et Légendes Arceus.
3. **Sécurité** : les dernières règles Firebase connues (`auth != null` en lecture et écriture à la racine) permettent encore de modifier librement le marché depuis un client authentifié. Les transactions ne suffisent pas contre un utilisateur malveillant. Voir `docs/firebase-marche-securite.md` pour l'architecture serveur et les règles à migrer.
4. **Tests réels** : aucun test confirmé sur deux navigateurs/appareils et deux identités Firebase, ni preuve de déploiement GitHub Pages. Aucun résultat de workflow GitHub Actions confirmé.

### Sources principales de cette extension

- [HeartGold/SoulSilver — Champions, Conseil 4](https://pokemondb.net/heartgold-soulsilver/gymleaders-elitefour)
- [HeartGold/SoulSilver — Team Rocket](https://www.serebii.net/heartgoldsoulsilver/teamrocket.shtml)
- [HeartGold/SoulSilver — Silver](https://www.serebii.net/heartgoldsoulsilver/rival.shtml)
- [Écarlate/Violet — Ligue Myrtille](https://www.serebii.net/scarletviolet/blueberryelitefour.shtml)
- [Team Skull et Pokémon de ses membres](https://www.pokepedia.fr/Team_Skull)
- [Professeur Platane](https://www.pokepedia.fr/Professeur_Platane)
- [Galaxie — bâtiment de Vestigion](https://bulbapedia.bulbagarden.net/wiki/Galactic_Eterna_Building)
- [Percupio et ses combats](https://www.serebii.net/legendsarceus/volo.shtml)

**Conclusion : catalogue et interface enrichis, logique locale testée ; produit réseau complet et sécurisé non encore démontré.**
