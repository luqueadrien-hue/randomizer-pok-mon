# Marché des Dresseurs — sécurité Firebase (mise à jour du 2 novembre 2026)

## Ce qui est réellement protégé aujourd'hui

Le client réalise chaque achat dans une **transaction Realtime Database** sur `rooms/{code}/trainerMarket`. La transaction relit l'état courant et refuse un Pokémon/forme déjà vendu, un budget insuffisant ou une équipe de six déjà pleine. Le stock est commun aux deux joueurs. La création du marché vérifie le propriétaire du salon ; la réinitialisation utilise aussi une transaction pour éviter d'effacer un achat intervenu entre la lecture et l'écriture.

**Ces garanties ne valent que pour des clients honnêtes.** Les anciennes règles très permissives communiquées à l'utilisateur étaient :

```json
{"rules":{".read":"auth != null",".write":"auth != null"}}
```

Avec cette écriture globale, **n'importe quel utilisateur authentifié**, y compris via une connexion anonyme, peut écrire dans un salon dont il connaît le code. Il peut modifier `catalog`, `sold`, `spent`, `teams` ou supprimer le marché sans passer par le code de l'interface. Il est donc incorrect de qualifier les achats de sécurisés en production.

## Mise à jour du dépôt au 2 novembre 2026

Le dépôt contient désormais `firebase.database.rules.json` avec des permissions limitées aux participants pour `trainerMarket` et aux places attribuées pour `trainerDraft6/choices/$seat` ; seul l'hôte est autorisé à initialiser le Draft. **Ces règles sont commitées mais leur publication dans la base Firebase réelle n'est pas vérifiée.** Sans publication, les nouvelles transactions peuvent recevoir `PERMISSION_DENIED`.

Les règles `trainerMarket/.write` restent toutefois volontairement permissives pour permettre la transaction client sur tout le marché : elles ne bloquent pas une écriture forgée par un participant. Elles ne constituent **pas** une sécurité de production. Le plan Cloud Functions ci-dessous reste nécessaire.

Pour publier les règles, ouvrir la console Firebase du projet associé au site, puis **Realtime Database → Règles** et remplacer le contenu par le fichier `firebase.database.rules.json` complet du dépôt, en vérifiant d'abord les autres modes réseau, puis cliquer **Publier**. Ne pas publier seulement les deux nouveaux nœuds. Après publication, effectuer un test avec deux sessions authentifiées distinctes, une création de Draft, un choix pour chaque joueur, une reconnexion et deux achats concurrents du même Pokémon au Marché.

## Architecture cible nécessaire

1. **Catalogue immuable côté serveur** : stocker la liste des équipes, leur provenance, les formes et la compatibilité dans une version validée. Le client ne doit jamais choisir librement le prix, le rang ou l'identité d'un Pokémon.
2. **Création par l'hôte côté serveur** : une Cloud Function vérifie `request.auth.uid === rooms/{code}/ownerUid`, les deux places attribuées, le statut `started`, le jeu de destination et le budget autorisé. Elle calcule le catalogue filtré à partir de données vérifiées.
3. **Achat côté serveur** : une Cloud Function vérifie que `request.auth.uid` correspond à `rooms/{code}/seats/1` ou `seats/2`. Dans une transaction atomique, elle contrôle l'identité espèce + forme dans **tous** les rangs, le prix fixe du rang, les six achats maximum et le budget restant, puis enregistre l'achat.
4. **Règles Realtime Database sans écriture parent permissive** : après migration des autres modes réseau, supprimer `".write": "auth != null"` à la racine et sous `rooms`. Le nœud `trainerMarket` doit être **non inscriptible par les clients** ; seul le compte de service Admin SDK de la fonction peut écrire. Une règle enfant `".write": false` n'annule **pas** une autorisation d'écriture accordée par un parent : il faut d'abord supprimer les autorisations trop larges.
5. **Émulateur Firebase** : tester un hôte, deux joueurs, un troisième utilisateur, les achats simultanés, l'usurpation d'UID, les écritures directes sur `sold` et `catalog`, la réinitialisation, la déconnexion/reconnexion et la suppression de salon.

## Ne pas publier des règles partielles

Ne pas copier uniquement une règle `trainerMarket/.write=false` dans la configuration actuelle : le parent `".write": "auth != null"` reste prioritaire pour autoriser l'écriture. Ne pas non plus remplacer la règle racine par `false` sans migrer les créations de salon, l'attribution des joueurs et les autres jeux : ils seraient bloqués.

## Statut

- Transactions et validations côté client : **implémentées**, simulations locales disponibles dans `tests/trainer-market.test.mjs`.
- Fonctions serveur et règles strictes déployées : **non**. Les règles intermédiaires ont été versionnées mais leur publication réelle n'a pas été confirmée.
- Vérification du déploiement GitHub Pages, de la base réelle et des tests à deux navigateurs : **non effectuée**.
- Les données des générations I à IX et les DLC restent **partiels**, même si les huit rangs sont représentés.

Sources techniques : [Firebase — Security Rules](https://firebase.google.com/docs/database/security) ; [Firebase — Transactions](https://firebase.google.com/docs/database/web/read-and-write#save_data_as_transactions) ; [Cloud Functions callable](https://firebase.google.com/docs/functions/callable).
