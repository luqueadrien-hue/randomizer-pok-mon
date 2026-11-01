# Marché des Dresseurs — bilan technique du 1er novembre 2026

> **Ce document décrit l'état initial à 19 h (250 occurrences).** La version enrichie de 21 h, avec **559 occurrences et 10 tests V8 réussis**, est disponible dans [le bilan 21 h](marche-bilan-2026-11-01-21h.md).

## Périmètre effectivement codé

- Mode non numéroté `trainerrankgrid` visible dans `index.html` et affichage d'une grille commune dans le salon réseau existant.
- **Huit rangs**, prix strictement fixes : 200 / 350 / 500 / 650 / 700 / 800 / 1 000 / 1 300 ₽. Le prix ne dépend jamais des statistiques.
- **250 occurrences de Pokémon historiques** saisies dans `TRAINER_MARKET_SEED` (une occurrence = un Pokémon dans l'équipe d'un dresseur ; une espèce peut avoir plusieurs occurrences). Les neuf générations sont représentées par des exemples, mais **le catalogue n'est absolument pas exhaustif**.
- Régions sources représentées : Kanto (Rouge/Bleu), Johto (Or/Argent/Cristal), Hoenn (Rubis/Saphir), Sinnoh (Diamant/Perle), Unys (Noir/Blanc), Kalos (X/Y), Alola (Soleil/Lune), Galar (Épée/Bouclier), Paldea (Écarlate/Violet).
- Jeu de destination au choix : Écarlate/Violet + DLC, Épée/Bouclier + DLC, Diamant Étincelant/Perle Scintillante, Légendes Arceus. Le filtre se base sur les Pokédex de destination PokeAPI pour SV/SWSH/PLA, et sur le Pokédex national des 493 espèces pour DEPS. Une liste conservatrice d'espèces transférables HOME complète partiellement SV/SWSH.
- Si un Pokédex attendu ne peut être chargé, **la création est refusée** plutôt que d'autoriser des espèces non vérifiées.
- Les formes explicitement identifiées dans les données (Plumeline Pom-Pom/Flamenco, Feunard d'Alola, Lougaroc Diurne) ont une identité de stock distincte et une liste de destinations autorisées. **Les autres formes ne sont pas encore toutes répertoriées**.
- Deux budgets indépendants, six achats maximum par joueur, et **stock exclusif commun** : une espèce/forme achetée dans un rang n'est plus achetable dans un autre rang. Achat sous `transaction` Firebase sur `rooms/{code}/trainerMarket`.

## Vérifications réellement effectuées

- Compilation syntaxique de l'unique script inline de `index.html` via le compilateur JavaScript V8 : aucune erreur détectée lors des dernières mises à jour.
- Extraction et audit du catalogue : **250 occurrences**, aucune collision d'identifiant d'entrée, les huit rangs non vides dans le corpus initial.
- Simulation locale de deux acheteurs sur le même état : un achat de Rattata à 200 ₽ par J1 est accepté, la tentative de J2 d'acheter Rattata dans le rang Team Rocket est refusée ; un achat indépendant à 1 000 ₽ est accepté.
- Simulation du filtre : présence des espèces dans les Pokédex fictifs, limites DEPS 1–493, rejet d'un Pokédex vide.
- Tests de régression versionnés dans `tests/trainer-market.test.mjs`, lancement prévu avec `node --test tests/trainer-market.test.mjs`. Workflow GitHub Actions créé dans `.github/workflows/trainer-market-tests.yml`. **L'exécution réelle du workflow et son résultat n'ont pas été confirmés**.

## Blocages avant d'annoncer « terminé et jouable en production »

1. **Corpus incomplet** : les 250 occurrences ne représentent qu'un échantillon de toutes les équipes de Kanto à Paldea, notamment les sbires, rivaux, dresseurs ordinaires, DLC, rematches, professeurs et variantes de jeu. Le corpus doit être audité jeu par jeu et version par version.
2. **Compatibilité incomplète** : les transferts HOME sont volontairement limités à une liste positive partielle. Le filtre d'espèce ne suffit pas à garantir toutes les formes, et certains jeux/dex doivent être validés en navigation réelle.
3. **Sécurité Firebase insuffisante** : les règles connues `{".read":"auth != null",".write":"auth != null"}` permettent à tout utilisateur authentifié de modifier directement l'état du marché. La transaction cliente empêche des collisions entre clients honnêtes mais **ne remplace pas une validation côté serveur**. Mettre en place des règles de validation robustes ou une Cloud Function avant de qualifier les achats de sécurisés.
4. **Pas de test bout en bout confirmé** : deux navigateurs/appareils avec deux identités Firebase différentes, création du salon, attribution des places, chargement des quatre Pokédex, achats simultanés, reconnexion et déploiement GitHub Pages restent à tester.
5. **Pas de preuve de déploiement public** : les commits sont dans la branche par défaut du dépôt ; aucune vérification externe du site publié n'a pu être faite pendant ce bilan.

## Procédure de test à deux joueurs

1. Ouvrir le site sur deux navigateurs distincts et créer/rejoindre le même salon réseau.
2. Attribuer J1 et J2, puis lancer le challenge depuis l'hôte.
3. Choisir « Marché des Dresseurs », sélectionner Écarlate/Violet + DLC et un budget de 3 000 ₽.
4. L'hôte clique sur « Créer / réinitialiser le marché » et attend le chargement du catalogue.
5. Vérifier que les deux joueurs voient les mêmes rangs et le même nombre d'entrées.
6. Faire acheter à J1 un Pokémon présent dans plusieurs rangs ; vérifier que J2 ne peut plus acheter cette espèce/forme ailleurs.
7. Tester deux clics simultanés, l'épuisement du budget, le plafond de six Pokémon et la reconnexion.

## Sources de départ

- Kanto : https://pokemondb.net/red-blue/gymleaders-elitefour
- Sbires Rocket : https://www.supercheats.com/pokemon-blue-digital/walkthrough/pokemon-blue-team-rocket-listings
- Johto : https://bulbapedia.bulbagarden.net/wiki/Appendix:Gold_and_Silver_walkthrough/Section_2
- Hoenn : https://pokemondb.net/ruby-sapphire/gymleaders-elitefour
- Sinnoh : https://pokemondb.net/diamond-pearl/gymleaders-elitefour
- Unys : https://pokemondb.net/black-white/gymleaders-elitefour
- Kalos : https://pokemondb.net/x-y/gymleaders-elitefour
- Alola : https://pokemondb.net/sun-moon/kahunas-elitefour
- Galar : https://www.serebii.net/swordshield/championcup.shtml
- Paldea : https://pokemondb.net/scarlet-violet/gymleaders-elitefour
- Dresseurs ordinaires Paldea : https://www.serebii.net/pokearth/paldea/southprovinceareaone.shtml
- Transferts HOME : https://www.serebii.net/scarletviolet/transferonly.shtml et https://www.serebii.net/swordshield/transferonly.shtml

**Conclusion : prototype multijoueur enrichi, non validé comme produit terminé.**
