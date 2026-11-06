# Draft des 6 Dresseurs — spécification et suivi d'implémentation

## Principe
- Mode réseau à deux joueurs, six manches chacun.
- À chaque partie, tirer six dresseurs au hasard parmi un catalogue vérifié. Les mêmes six dresseurs sont visibles pour les deux joueurs.
- Chaque dresseur propose trois Pokémon distincts, avec des sets générés et valides pour le jeu sélectionné. Les espèces, attaques, objets et talents doivent être compatibles avec Pokémon Écarlate/Violet et DLC.
- Chaque joueur choisit un dresseur encore inutilisé **par ce joueur**, puis un de ses trois Pokémon. Ce dresseur devient indisponible pour lui lors des manches suivantes.
- Les dresseurs ne sont pas bloqués globalement : l'autre joueur peut choisir le même dresseur et le même Pokémon.
- Après six manches, chaque joueur a six Pokémon issus des six dresseurs, sans répétition de dresseur pour un même joueur.

## Sets et personnalisation
- Fixes : Pokémon proposé, objet tenu, talent, EV et IV, selon un set généré pour le dresseur. Les quatre attaques sont personnalisables par le joueur parmi les capacités légales du Pokémon dans le jeu sélectionné.
- Modifiables par le joueur : les quatre attaques du set, la nature et, uniquement dans Écarlate/Violet, le type Téracristal.
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
- Les sets sont générés puis figés par le système (et non choisis manuellement par les dresseurs). Quatre attaques initialement proposées mais modifiables par le joueur parmi les attaques légales du Pokémon ; objet, talent et EV/IV prédéfinis sous réserve des contraintes du jeu choisi.
- La prise en charge d'un jeu doit être désactivée tant que les dresseurs disponibles, les données Pokémon et les validations de sets n'y sont pas suffisants.

## État au 2 novembre 2026
- **Code implémenté sur `main`** : sélection de six dresseurs distincts, tirage de 18 espèces différentes parmi un ensemble de candidats de Paldea, sets fixes, personnalisation de quatre capacités, de la nature et du type Téracristal, six choix par joueur, interdiction de réutiliser un dresseur pour le même joueur. Les deux joueurs peuvent sélectionner les mêmes propositions.
- **Réseau** : tirage hôte et choix par joueur stockés dans `rooms/$room/trainerDraft6` ; transaction Firebase sur `choices/$seat`, synchronisation via l'écoute du salon et reprise de l'état au reconnectement. Règles de base ajoutées dans `firebase.database.rules.json`.
- **Périmètre réellement activé** : Écarlate/Violet, uniquement espèces de la liste candidate figurant dans le Pokédex de base de Paldea ; capacités filtrées selon la version `scarlet-violet` de PokéAPI. Les autres jeux Switch, les formes particulières, les transferts HOME et la couverture DLC sont désactivés jusqu'à validation.
- **Tests** : tests unitaires Node et contrôles statiques intégrés à GitHub Actions ; aucun test de bout en bout à deux comptes Firebase ni validation complète de légalité compétitive n'a encore été exécuté.
- **Déploiement** : les fichiers GitHub Pages sont publiables automatiquement, mais les règles Firebase commitées doivent être déployées dans la console Firebase ou via un pipeline disposant des autorisations nécessaires. Sans ce déploiement, les écritures `trainerDraft6` et `trainerMarket` peuvent être refusées.
- **Limites** : PokéAPI peut être indisponible ; les capacités non traduites s'affichent en anglais ; les objets tenus sont issus d'une courte liste de quatre objets connus d'Écarlate/Violet ; EV/IV prédéfinis légaux mais non optimisés. Les règles Firebase actuelles ne suffisent pas encore à garantir contre un client malveillant l'immuabilité des offres et la légalité de chaque attaque : renforcement côté serveur nécessaire avant un usage compétitif ouvert.

**Statut : bêta codée, tests unitaires réussis ; fonctionnement réseau réel à confirmer après publication des règles et test sur deux navigateurs.**

## Variantes de boîtes et règles de dévoilement (demandes ultérieures)
- **Boîtes indépendantes** : chaque joueur reçoit ses propres propositions aléatoires ; les tirages d'un joueur ne consomment pas le stock de l'autre. Éviter les doublons de proposition à l'intérieur d'une même boîte.
- **Boîte commune** : mêmes propositions cachées pour les deux joueurs. Un Pokémon dévoilé est consommé et ne peut plus être dévoilé ou attribué une seconde fois, même par l'autre joueur ; verrouillage atomique Firebase nécessaire avant révélation.
- Ces variantes modifient la règle historique « les deux joueurs peuvent choisir le même Pokémon ». Ne pas appliquer l'exclusivité globale au mode indépendant.
- La question de la consommation des deux Pokémon non choisis parmi trois propositions dévoilées n'est pas définitivement arbitrée ; ne pas implémenter silencieusement une règle irréversible sans décision explicite.
- Les restrictions de **rang et budget** concernent le Marché des Dresseurs, pas la limite d'un dresseur par joueur dans ce Draft.
- **État** : règles documentées seulement ; ne pas présenter ces deux variantes comme implémentées ni testées.
