# Rébus illustrés — suivi de production (Écarlate/Violet + DLC)

## Règle validée

**Une seule scène dessinée par Pokémon.** Les éléments du nom français sont réunis naturellement dans le même dessin (par exemple une carpe qui tient une baguette magique). Pas de nom écrit, de texte-solution, de sprite Pokémon ni de plusieurs cases séparées. Les solutions restent réservées à l'organisateur dans l'interface jusqu'à la révélation. Les formes régionales et alternatives sont des entrées distinctes ; un dessin de la forme de base n'est pas automatiquement validé pour une forme différente.

## Périmètre et sources à croiser

Ne pas confondre le Pokédex national (1 025 espèces) avec les espèces réellement compatibles avec Écarlate/Violet. Le catalogue final doit réunir sans doublon : Pokédex de Paldea, Septentria (Le Masque Turquoise), Institut Myrtille/Terarium (Le Disque Indigo), Pokémon uniquement transférables par HOME, événements et formes compatibles. Clé de déduplication : numéro national **et** identifiant de forme, pas uniquement le nom affiché.

Sources de vérification croisées (à auditer entrée par entrée) :
- [Nintendo Life — Pokémon de retour, DLC compris](https://www.nintendolife.com/guides/pokemon-scarlet-and-violet-all-returning-pokemon-including-dlc)
- [Nintendo Life — Pokémon transférables uniquement par HOME](https://www.nintendolife.com/guides/pokemon-scarlet-and-violet-all-transfer-only-pokemon-available-via-home)
- [Nintendo Wire — formes régionales dans Le Disque Indigo](https://nintendowire.com/guides/pokemon-scarlet-and-violet/where-to-find-all-of-the-regional-form-pokemon-in-the-indigo-disk/)
- [PokéAPI — données espèces et variétés](https://pokeapi.co/docs/v2) : utile pour les identifiants et noms, **insuffisant seul** pour certifier la compatibilité avec Écarlate/Violet.

Le champ `sv` actuel du site repose notamment sur les attaques répertoriées dans PokéAPI et sur des exceptions numériques. Ce n'est pas encore une liste de compatibilité certifiée. **Ne pas annoncer une couverture exhaustive** tant que la liste complète, les formes et les événements n'ont pas été confrontés à plusieurs sources.

## Illustrations effectivement intégrées dans index.html

| Numéro national | Nom français | Dessin unique | État |
|---:|---|---|---|
| 129 | Magicarpe | Une carpe bleue tient une baguette étoilée au-dessus de l'eau | SVG intégré |
| 58 | Caninos | Un chien tient un grand os dans la gueule | SVG intégré |
| 38 | Feunard | Un renard à une seule queue se tient près d'un feu de camp | SVG intégré |
| 28 | Sablaireau | Un blaireau est à côté d'un château de sable | SVG intégré |
| 9 | Tortank | Une tortue conduit un petit char d'assaut | SVG intégré |
| 37 | Goupix | Un renard observe six pommes | SVG intégré |
| 39 | Rondoudou | Un doudou parfaitement rond | SVG intégré |
| 113 | Leveinard | Un canard tient un trèfle à quatre feuilles | SVG intégré |

Ce sont des dessins vectoriels originaux intégrés au code, **pas** des fichiers PNG produits par un générateur d'images. Leur lisibilité doit encore être testée auprès de vrais joueurs. Les autres Pokémon utilisent encore les rébus textuels existants ou le découpage phonétique provisoire.

## Concepts supplémentaires — **non dessinés**, à vérifier et à illustrer

| N° | Pokémon | Concept d'une scène unique |
|---:|---|---|
| 1 | Bulbizarre | Un bulbe de plante portant un déguisement très étrange |
| 4 | Salamèche | Une salamandre coiffée d'une mèche de cheveux enflammée |
| 6 | Dracaufeu | Un dragon soufflant une longue flamme sur un feu de camp |
| 7 | Carapuce | Une tortue portant une carapace avec une minuscule puce posée dessus |
| 25 | Pikachu | Un pika sauvage éternuant avec des éclairs autour de lui |
| 52 | Miaouss | Un chat miaulant devant un microphone, avec des ondes sonores |
| 54 | Psykokwak | Un canard tentant de lire dans une boule de cristal qui se fissure |
| 59 | Arcanin | Un chien debout au centre d'un cercle de symboles magiques |
| 74 | Racaillou | Un gros rocher couvert de minuscules cailloux |
| 79 | Ramoloss | Un molosse endormi, complètement affalé dans un hamac |
| 81 | Magnéti | Un aimant en fer à cheval attirant une pluie de vis |
| 133 | Évoli | Une chenille en pleine métamorphose vers un papillon |
| 134 | Aquali | Un lit flottant sur une vague d'eau |
| 135 | Voltali | Un lit traversé par un éclair électrique |
| 136 | Pyroli | Un lit entouré de flammes de cheminée |
| 143 | Ronflex | Un sportif ronflant pendant qu'il contracte ses muscles |
| 149 | Dracolosse | Un dragon soulevant une immense statue de colosse |
| 102 | Nœunœuf | Deux œufs attachés ensemble par un gros nœud de ruban |
| 926 | Pâtachiot | Un chiot sculpté dans une pâte à pain sur une plaque de boulanger |
| 938 | Têtampoule | Un têtard nageant à l'intérieur d'une ampoule lumineuse |

**Statut de ce tableau : idées de dessin seulement.** Les formulations et la compatibilité précise des formes doivent être vérifiées avant intégration ; certaines idées peuvent être trop proches de l'apparence du Pokémon ou trop évidentes. Les entrées ne doivent pas être déclarées prêtes avant création et contrôle de leur illustration.

## Contrôles à effectuer par lot

1. Vérifier la présence réelle dans Écarlate/Violet, DLC et HOME, et l'identifiant de chaque forme.
2. Vérifier que le concept correspond au **nom français exact** et qu'il n'est pas confondu avec un autre Pokémon.
3. Dessiner une scène cohérente, sans sprite officiel, texte, légende, nom ni réponse cachée dans l'attribut `alt`.
4. Tester l'affichage sur PC et mobile, puis le rôle randomiseur/devineur dans deux navigateurs.
5. Vérifier la synchronisation Firebase et la non-divulgation des solutions dans l'interface. **La confidentialité des données Firebase elles-mêmes reste à auditer séparément.**
6. Intégrer uniquement les illustrations prêtes ; conserver une distinction entre « concept », « illustration produite » et « illustration testée ».

