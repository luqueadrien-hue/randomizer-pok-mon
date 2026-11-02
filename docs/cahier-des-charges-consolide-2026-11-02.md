# Cahier des charges consolidé — Randomizer Pokémon
*Mise à jour : 2 novembre 2026 — distinguer demande, code et validation.*

## Principes communs
- Interface française, PC/mobile/tablette, salons réseau à deux joueurs avec rôles corrects, reprise et état Firebase synchronisé.
- Les formes alternatives et régionales sont des entrées distinctes dans **tous** les jeux et tirages ; leurs caractéristiques propres doivent être utilisées.
- Les Pokémon, objets, attaques et mécaniques sont filtrés par jeu/version et DLC ; HOME est un mode d'obtention distinct et ne constitue pas une preuve de légalité.
- Un indice sans source fiable ou champ requis doit être signalé comme incomplet, jamais inventé. Un tirage impossible doit être relancé ou bloqué avec explication.
- Rébus **phonétiques uniquement** ; ne pas relancer les illustrations Écarlate/Violet.

## Jeux numérotés : décisions de réorganisation
Les numéros ci-dessous sont des **anciens identifiants de demande**, pas une nouvelle numérotation finale.
- Fusionner **13 + 18** (évolution/chaîne/méthode/niveau), **14 + 52** (talents ordinaires/cachés), **22 + 32** (habitat), **48 + 50** (indices doublonnés selon la demande).
- Retirer les anciens **46 et 47**, le mode non numéroté VGC compétitif et les autres modes explicitement abandonnés.
- Conserver distincts **6** (une attaque) et **27** (quatre attaques/movepool), **8** (couleurs normales) et **33** (chromatiques), **38** (première console) et **40** (première région), **15**, **20**, **45**, ainsi que **29** (numéro national) et **30** (numéro régional).
- Renuméroter par **ordre alphabétique** après validation de la liste active, sans réutiliser les anciens numéros pour prétendre qu'un jeu a disparu.
- Le sélecteur actuel comporte encore des numéros discontinus : **renumérotation alphabétique non achevée**. Les anciennes sauvegardes et salons doivent rester compatibles via les identifiants techniques des modes.

## Modes non numérotés
- **Draft des 6 Dresseurs** : jeu Switch sélectionné, six dresseurs distincts, 18 propositions communes figées pour la partie, six choix par joueur (un par dresseur), mêmes Pokémon autorisés pour les deux joueurs, quatre capacités personnalisables parmi les attaques légales, nature et Téracristal seulement dans Écarlate/Violet, objets/talents/EV/IV prédéfinis. Refaire le tirage à chaque nouvelle partie et éviter si possible la répétition précédente. **Présentation souhaitée : reprendre la grille et les interactions de la Boîte Randomizer**. Statut observé : bêta codée SV ; pas de preuve de test réel à deux comptes Firebase, interface « boîte » non certifiée, autres jeux et DLC/HOME non validés.
- **Marché des Dresseurs** : grille et stock partagés, budgets individuels, six achats maximum, achat exclusif d'une espèce+forme, transaction Firebase atomique, provenance historique sourcée par dresseur et jeu. **Conflit à résoudre** : demande récente de sept rangs, mais le dépôt utilise actuellement huit rangs dont les professeurs combattants ; ne pas supprimer une catégorie ni changer les prix sans migration explicite. Tests de concurrence et sécurité serveur encore à valider.
- **Boîte randomisée**, **Dilemmes impossibles**, **Modulo Pokédex**, **NOËL**, **Enchères**, **Qui est-ce ?**, **Pendu** et autres modes conservés selon les décisions déjà prises.

## Modulo Pokédex — comportement requis et état
- Afficher le Pokémon de départ et son **numéro du Pokédex national**.
- Permuter tous les chiffres, avec un zéro supplémentaire facultatif ; autoriser le numéro initial ; éliminer les doublons et les numéros hors Pokédex national.
- Exemple n° **032** : **023 Abo, 032 Nidoran♂, 203 Girafarig, 230 Hyporoi, 302 Ténéfix, 320 Wailmer**.
- Proposer **toutes** les permutations correspondant à des espèces dont la disponibilité est vérifiée dans le jeu Switch choisi, avec numéro national et nom français. Ne pas proposer de distracteurs arbitraires.
- Les propositions sont préparées par le randomiseur puis révélées au devineur après validation ; synchronisation des choix par Firebase.
- **Implémenté dans cette mise à jour** : suppression des distracteurs et des transferts non vérifiés, refus des Pokédex partiellement chargés, affichage du numéro national et du Pokémon initial. **Limite** : compatibilité HOME hors Pokédex régional non couverte ; l'exhaustivité des DLC et de la légalité par forme reste à auditer ; tests réseau réels non exécutés.

## Lieux de rencontre — distinct du jeu Habitat
- Reprendre le mode existant « Lieu de capture » comme **« Lieux de rencontre — par jeu et version »**, plutôt que créer un doublon technique.
- Afficher pour chaque route, grotte, chenal, forêt, zone, etc. le **jeu exact**, la version, la région, la génération, le nom français officiel et, si connu, le secteur, la méthode et les conditions (horaire, météo, pêche, niveau, DLC).
- Intégrer séparément les **échanges avec PNJ/dresseurs** (PNJ, lieu, Pokémon demandé/reçu), cadeaux, fossiles, événements et autres obtentions documentées. Ne jamais présenter un échange entre joueurs comme une rencontre sauvage.
- **Implémenté partiellement** : les indices déjà sourcés dans `encounterInfo` contiennent zone + jeu/version, et le jeu affiche ces détails ; quelques localisations SV ont été vérifiées manuellement. **Non achevé** : couverture complète de toutes les générations, échanges PNJ, cadeaux, événements et formes.

## Audit de qualité et d'exhaustivité
Pour chaque entrée espèce + forme, jeu et version, vérifier : numéro national/régional, noms français, types, formes, générations, stats, EV/IV, attaques et méthodes d'apprentissage, talents/cachés, objets, évolutions, reproduction, tailles/poids, taux, bonheur, descriptions, sprites, cris, musique, rencontres, cadeaux/échanges et transferts.
- Exiger une provenance par donnée/version ; distinguer absence de données, non-disponibilité confirmée et incompatibilité.
- Couverture du Marché déjà documentée : **609 occurrences de dresseurs**, **362 identités espèce + forme** ; ce n'est ni le Pokédex national complet ni un corpus historique exhaustif.
- PokéAPI permet certaines données par version, mais **ne prouve pas à elle seule** la disponibilité HOME/DLC ou la légalité d'un set compétitif.
- Priorité de tests : permutations Modulo, reprise des anciens salons, transactions concurrentes Firebase, deux comptes/navigateurs, conformité du Draft, intégrité des fiches et absence d'indices trompeurs.

## Livraison et preuves
- Ne committer que des modifications réelles, tester dans la mesure des outils disponibles, vérifier les résultats de GitHub Actions et GitHub Pages séparément.
- **Un commit sur GitHub n'est pas une preuve de publication des règles Firebase.**
- Ne pas déclarer « entièrement fonctionnel en réseau » sans essais à deux comptes et vérification des autorisations de la base réelle.
