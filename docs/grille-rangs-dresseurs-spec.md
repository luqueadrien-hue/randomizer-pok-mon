# Mode non numéroté : Grille des quatre rangs de dresseurs

## Disposition (de bas en haut)
1. **Dresseurs de base** : Pokémon employés par les dresseurs ordinaires facultatifs/non obligatoires des jeux.
2. **Organisation antagoniste** : Team Rocket, Team Star et leurs équivalents selon le jeu, y compris membres et chefs selon le filtre défini.
3. **Rivaux** : Pokémon utilisés par les rivaux officiels.
4. **Conseil 4 / Maître de Ligue / équivalent** : Pokémon employés par les membres du Conseil 4, les Maîtres, et leurs homologues dans les jeux dont la structure diffère.

## Sources et filtres
- Sélection d'un jeu cible, ex. Écarlate/Violet + DLC.
- Les Pokémon figurant dans chaque rang doivent être attestés dans les équipes des dresseurs du rang, parmi les jeux vidéo Pokémon officiels, puis **filtrés** pour ne retenir que les espèces/formes effectivement utilisables dans le jeu cible.
- Un Pokémon peut figurer dans plusieurs rangs s'il a été utilisé par plusieurs catégories de dresseurs.
- Les noms des dresseurs et les équipes sont des données historiques à sourcer par version/jeu, en distinguant les formes régionales.
- Le nombre de Pokémon par rang dépend du corpus réel ; ne pas inventer de liste exhaustive ni confondre les Pokémon d'un dresseur avec les espèces accessibles dans le jeu.
- Le jeu est non numéroté et doit être jouable à deux en réseau, avec un tirage partagé, une grille commune, des choix par joueur et des états synchronisés.

## Économie et achats (proposition à valider)
- La grille est **commune aux deux joueurs** : même inventaire et mêmes prix visibles.
- Chaque joueur possède son propre budget, identique au départ, et achète jusqu'à **six Pokémon maximum**. Il peut s'arrêter avant six.
- Paliers proposés par joueur : 1 500 ₽ (petit budget), **3 000 ₽ (standard par défaut)**, 4 500 ₽ (confirmé), 6 500 ₽ (prestige), ou budget illimité.
- Tarifs suggérés par rang : dresseurs de base **100–300 ₽**, organisations antagonistes **350–600 ₽**, rivaux **650–950 ₽**, Conseil 4 / Maîtres / équivalents **1 000–1 500 ₽**.
- À l'intérieur de chaque rang, fixer le prix individuel selon puissance, stade d'évolution et potentiel stratégique. Ces fourchettes sont une proposition de conception, pas encore des prix calculés et testés pour chaque espèce.
- Les achats, soldes et effectifs sont synchronisés via Firebase ; le serveur/logique transactionnelle doit refuser tout achat au-delà du budget ou de six Pokémon.
- **Point à trancher** : un Pokémon acheté par un joueur est-il retiré de la grille pour l'autre (stock partagé) ou reste-t-il achetable par les deux (catalogue commun sans exclusivité) ?

## Statut
Spécification proposée ; **corpus historique des équipes à compiler et vérifier**, logique de tirage et interface réseau à développer. Ne pas afficher ce mode comme opérationnel avant validation.
