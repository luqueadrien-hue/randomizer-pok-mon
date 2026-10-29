# Étape 4 — vérification des autorisations Firebase (NON VALIDÉE)

Ce document est un protocole de test, pas un certificat de sécurité. Ne pas publier `firebase.database.rules.json` en production avant essais dans Firebase Emulator Suite.

## Contrôles à effectuer dans l'émulateur
- Authentification anonyme A, B, C avec UID distincts.
- A crée `rooms/TESTSEC` avec `ownerUid=A`, `hostIds/A=true`, `players/A`.
- B ajoute `players/B` avec `role=player` (autorisé).
- B tente de modifier `players/A` (refusé).
- B tente de s'attribuer `role=host` (refusé).
- B tente de changer `ownerUid`, `hostIds`, `seats/1`, `started` (refusé).
- A modifie `seats/1`, `seats/2` et `started` (autorisé).
- A et B écrivent `state` (actuellement autorisé pour tous les membres ; à renforcer par rôle).
- C tente d'écrire `state` ou `players/A` (refusé).
- B tente de supprimer `rooms/TESTSEC` (refusé).
- A crée les tables `TESTSEC+T1` et `TESTSEC+T2` en écriture multipath, puis teste le passage lobby/table.
- Tester déconnexion `onDisconnect`, retour lobby et reconnexion.
- Tester tous les jeux utilisant `questionDuel`, `hangman`, `trioPrivate`, `trioProgress`, `impossibleDilemma`, `blindDraft`, `auctionRound`, `modulo`.

## Limitations connues — bloquantes pour une sécurité complète
1. `rooms/$room/.read = auth != null` : tous les utilisateurs authentifiés peuvent lire tous les salons, y compris les états et données privées. Un code court ne garantit pas la confidentialité.
2. Les membres d'un salon peuvent encore modifier librement `state` et plusieurs branches de jeu. La séparation randomiseur/devineur n'est donc pas encore garantie côté serveur.
3. Les salles existantes sans `ownerUid` nécessitent une migration ou une nouvelle création.
4. Les règles n'ont pas été exécutées dans l'émulateur, et aucun test multijoueur automatisé n'est passé.

## Publication
Ne remplacer les règles de production qu'après validation de ces scénarios et résolution des limitations bloquantes. Sauvegarder les règles précédentes pour permettre un retour arrière.

## Intégration du 29 octobre 2026
- Vérification côté client de l'UID Firebase du propriétaire avant le lancement du challenge.
- Validation renforcée des profils et sièges dans le fichier de règles préparatoire.
- **Non déployé dans Firebase** : les règles de production restent provisoires.
- **Non terminé** : confidentialité des salons et des réponses, contrôle serveur des manches, protection complète des tables, validation de toutes les branches de jeu, tests émulateur.
- Ne pas présenter ces changements comme l'intégration complète des douze protections.

## Audit complémentaire — fuite des réponses (29 octobre)
- `mpSnapshot()` place `current[].pokemonId` dans `/rooms/$room/state`, lu par les deux joueurs.
- `mpHydrateState()` reconstruit le Pokémon depuis ce champ ; le supprimer sans protocole de sélection/révélation casserait le déroulement du jeu.
- `state.current[].dexChoices`, `teams`, et d'autres champs doivent être audités pour éviter des divulgations avant révélation.
- La correction exige une séparation des propositions publiques et des tirages privés, avec un protocole de révélation, et des règles empêchant le devineur de lire les tirages privés.
- Ne pas publier les règles tant que cette séparation n'est pas implémentée et testée.
