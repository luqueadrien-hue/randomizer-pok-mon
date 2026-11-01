# Draft des 6 Dresseurs — spécification (à implémenter)

## Principe
- Mode réseau à deux joueurs, six manches chacun.
- À chaque partie, tirer six dresseurs au hasard parmi un catalogue vérifié. Les mêmes six dresseurs sont visibles pour les deux joueurs.
- Chaque dresseur propose trois Pokémon distincts, avec des sets préétablis inspirés de ce dresseur. Les espèces, attaques, objets et talents doivent être compatibles avec Pokémon Écarlate/Violet et DLC.
- Chaque joueur choisit un dresseur encore inutilisé **par ce joueur**, puis un de ses trois Pokémon. Ce dresseur devient indisponible pour lui lors des manches suivantes.
- Les dresseurs ne sont pas bloqués globalement : l'autre joueur peut choisir le même dresseur et le même Pokémon.
- Après six manches, chaque joueur a six Pokémon issus des six dresseurs, sans répétition de dresseur pour un même joueur.

## Sets et personnalisation
- Fixes : Pokémon, quatre attaques, objet tenu, talent, EV et IV, selon un set associé au dresseur.
- Modifiables par le joueur : nature et type Téracristal uniquement.
- Les sets doivent être complets, cohérents et validés pour Écarlate/Violet. Les exemples de dresseurs (Sacha, Ondine, Pierre, Major Bob, etc.) ne valent pas encore données validées.

## Réseau et états
- L'hôte détermine une seule sélection de six dresseurs et leurs propositions pour le salon.
- Enregistrer pour chaque joueur les dresseurs déjà utilisés, les six choix et les personnalisations.
- Contrôler côté logique de jeu l'interdiction de réutiliser un dresseur et la validité du Pokémon choisi.
- Synchroniser les choix et les manches sans révéler de données privées prématurément.
- Prévoir reconnexion et tests à deux navigateurs.

## Décision connexe
- Abandonner le chantier des **rébus illustrés** Écarlate/Violet + DLC ; conserver et améliorer uniquement les **rébus phonétiques**.


## Tirage par jeu et renouvellement des parties
- Au lancement, sélectionner un jeu de référence parmi les jeux Switch pris en charge : Écarlate/Violet (DLC inclus), Épée/Bouclier (DLC inclus), Diamant Étincelant/Perle Scintillante et, si un catalogue de dresseurs suffisant est établi, Légendes Pokémon : Arceus.
- Tirer six dresseurs distincts dans le catalogue du jeu sélectionné. Leurs Pokémon n'ont **aucun lien obligatoire** avec leur équipe officielle, leur spécialité ou leurs types.
- Générer trois Pokémon aléatoires par dresseur, soit 18 propositions communes aux deux joueurs. Les espèces et formes doivent être effectivement disponibles et utilisables dans le jeu de référence ; les sets, attaques, objets, talents et mécaniques doivent être valides dans ce jeu.
- Conserver les propositions stables pendant la partie ; au démarrage d'une **nouvelle partie**, refaire les tirages des six dresseurs et des 18 Pokémon, même si les joueurs sont les mêmes.
- Éviter si possible de reproduire la sélection précédente, sans garantir six nouveaux dresseurs lorsque le catalogue est limité ; enregistrer la dernière sélection par salon si nécessaire.
- Le type Téracristal n'est personnalisable que pour Écarlate/Violet ; ne pas afficher une mécanique inexistante dans les autres jeux. La nature reste personnalisable si applicable.
- Les sets sont générés puis figés par le système (et non choisis manuellement par les dresseurs). Quatre attaques, objet, talent, EV/IV prédéfinis sous réserve des contraintes du jeu choisi.
- La prise en charge d'un jeu doit être désactivée tant que les dresseurs disponibles, les données Pokémon et les validations de sets n'y sont pas suffisants.

## État
Spécification uniquement : ce fichier ne signifie pas que le nouveau mode est codé ou testé.
