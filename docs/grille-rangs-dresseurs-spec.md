# Mode non numéroté : Marché des Dresseurs — grille commune

## Rangs proposés (de bas en haut)
| Rang | Catégorie | Prix fixe par Pokémon |
|---|---|---:|
| 1 | Dresseurs ordinaires facultatifs | 200 ₽ |
| 2 | Sbires des organisations antagonistes | 350 ₽ |
| 3 | Champions d'Arène et équivalents | 500 ₽ |
| 4 | Rivaux officiels | 650 ₽ |
| 5 | Admins et chefs des organisations antagonistes | 800 ₽ |
| 6 | Conseil 4 et équivalents | 1 000 ₽ |
| 7 | Maîtres de Ligue, boss ultimes et équivalents | 1 300 ₽ |

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
