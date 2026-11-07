# Mode non numéroté : Marché des Dresseurs — grille commune à sept rangs

## Rangs proposés (de bas en haut)
| Rang | Catégorie | Prix fixe par Pokémon |
|---|---|---:|
| 1 | Dresseurs ordinaires facultatifs | 200 ₽ |
| 2 | Sbires des organisations antagonistes | 350 ₽ |
| 3 | Champions d'Arène et équivalents | 500 ₽ |
| 4 | Rivaux officiels | 650 ₽ |
| 5 | Professeurs Pokémon combattants | 700 ₽ |
| 6 | Admins et chefs des organisations antagonistes | 800 ₽ |
| 7 | Conseil 4, Maîtres de Ligue, boss ultimes et équivalents | 1 000 ₽ |

La catégorie des professeurs ne comprend que les professeurs effectivement affrontés dans un combat officiel ; pour Sada et Turum, distinguer leurs homologues IA. Emblème proposé : toque universitaire et Poké Ball sur fond turquoise.

Les catégories spécifiques (chefs d'installations de combat, personnages majeurs des DLC, dresseurs spéciaux) doivent être rattachées au rang analogue approprié, après vérification de leur rôle dans chaque jeu. Aucun rang ne doit être attribué arbitrairement.

## Provenance et disponibilité
- Sélectionner un jeu cible, par exemple Écarlate/Violet + DLC.
- Constituer chaque rang à partir des Pokémon **effectivement utilisés** par les dresseurs de cette catégorie dans les jeux vidéo Pokémon officiels ; sourcer les équipes par version, puis filtrer strictement les espèces/formes jouables dans le jeu cible.
- Un Pokémon peut avoir plusieurs apparitions historiques dans des catégories différentes ; il peut donc être proposé dans plusieurs rangs du catalogue initial, mais **une espèce/forme donnée ne peut être achetée qu'une seule fois au total par partie**, tous rangs confondus.
- Ne pas prétendre que le corpus est exhaustif avant audit des équipes historiques et des compatibilités.

## Achats et réseau
- **Une seule grille commune** aux deux joueurs : mêmes Pokémon, mêmes prix et stock partagé.
- Chaque joueur dispose de son **propre budget**, identique au départ, et peut acheter **jusqu'à six Pokémon maximum** (moins de six autorisé).
- Budgets proposés : 1 500 ₽, **3 000 ₽ par défaut**, 4 500 ₽, 6 500 ₽, illimité.
- **Prix exclusivement fixé par le rang** dans le tableau, sans modulation selon puissance, statistiques, rareté ou évolution.
- **Exclusivité d'achat : dès qu'un joueur achète un Pokémon, l'autre ne peut plus l'acheter.** L'interface doit retirer ou marquer indisponible l'espèce/forme dans tous les rangs concernés.
- Achat Firebase par transaction atomique sur un état de marché commun : vérifier dans la même transaction l'absence de vente antérieure, le solde, la limite de six et la validité de l'entrée, puis déduire le prix et attribuer le Pokémon. Empêcher les doubles achats simultanés et synchroniser les soldes, équipes et disponibilités.

## Statut
Mode non numéroté spécifié, **non opérationnel** tant que corpus, interface, achats atomiques et tests à deux joueurs ne sont pas réalisés.

## Portée intergénérationnelle obligatoire (clarification utilisateur du 01/11/2026)
- **Source des dresseurs : toutes les générations I à IX et leurs remakes, ainsi que les DLC et les jeux principaux ultérieurs pertinents.** Ne pas limiter les équipes historiques aux dresseurs de Paldea ou au jeu cible.
- **Filtre de destination indépendant :** sélectionner un jeu Switch cible et ses DLC (Écarlate/Violet, Épée/Bouclier, DEPS, etc.) ; n'afficher dans chaque rang que les Pokémon/formes réellement jouables dans ce jeu, y compris via transferts HOME autorisés. Un Pokémon issu de Kanto peut figurer dans le marché d'Écarlate/Violet s'il est compatible.
- Pour chaque apparition, conserver `pokemonId`, `formId`, `trainerId`, `trainerNameFR`, `trainerRankAtBattle`, `sourceGame`, `sourceGeneration`, `battleVariant`, `sourceUrl`. La catégorie est déterminée par le **rôle du dresseur dans ce combat précis** (sbire, admin, chef, champion d'Arène, rival, professeur combattant, Conseil 4, Maître), et non par la puissance du Pokémon.
- Une espèce/forme peut être présente dans plusieurs catégories et chez plusieurs dresseurs. L'achat exclusif doit s'appliquer à son **identité espèce + forme**, quel que soit son rang ou son propriétaire d'origine ; les formes régionales restent distinctes.
- Les équipes du Conseil 4 de Kanto, de la Team Rocket et de toutes les autres régions sont à intégrer sur cette base ; les DLC sont inclus dans le filtre de destination et dans les sources d'équipes.
- **Ne pas déclarer le corpus complet** avant un audit de couverture génération par génération, dresseur par dresseur, forme par forme et jeu cible par jeu cible.
- Sources de référence : https://www.serebii.net/pokearth/kanto/1st/indigoplateau.shtml (exemple équipes Kanto) ; https://home.pokemon.com/fr-fr/move/ et https://support.pokemon.com/hc/fr/articles/360039592832-Comme-savoir-vers-quels-jeux-je-peux-transf%C3%A9rer-mes-Pok%C3%A9mon-depuis-Pok%C3%A9mon-HOME (compatibilité).

## Harmonisation du 7 novembre 2026
- Les anciennes entrées classées au rang 8 (Maîtres) sont affichées au rang 7 commun au Conseil 4 et aux Maîtres, sans suppression de leur provenance historique. Le prix du rang 7 est fixé à 1 000 ₽ pour toutes ces entrées.
- Les sept rangs ne limitent pas le nombre d'achats par catégorie : seul le budget et le maximum de six Pokémon par joueur s'appliquent.
- Cette harmonisation de l'interface et des tarifs ne constitue **pas** une validation de la couverture des équipes historiques ni des tests Firebase à deux joueurs.
