# Plan de sécurisation du multijoueur

## Constat vérifié dans index.html (25 octobre 2026)
- `mpSnapshot()` construit `current` avec `pokemonId` et d'autres informations de proposition.
- `mpSyncState()` écrit ce résultat dans `rooms/<code>/state`.
- Le rendu masque certains noms dans l'interface, mais ce masquage ne suffit pas à empêcher un client de lire les données reçues.

## Correction à réaliser avant validation des jeux secrets
1. Définir un état public contenant uniquement le mode, le tour, les indices publics et les équipes déjà révélées.
2. Séparer l'état privé des réponses par utilisateur dans des chemins Firebase protégés par des règles de sécurité basées sur `auth.uid`.
3. Ne pas publier les identifiants, sprites, noms, formes ni les autres métadonnées permettant de retrouver la réponse avant révélation.
4. Pour les devinettes phonétiques/illustrées, ne transmettre que le rébus ou les éléments visibles, sans l'identifiant du Pokémon.
5. Tester à deux comptes anonymes distincts qu'un joueur ne peut pas lire le corrigé de l'autre.
6. Vérifier les règles de Firebase Realtime Database dans la console du projet avant tout déploiement. **Ne pas déployer des règles permissives.**

## Exécution des audits
```bash
python3 tools/audit_application.py
python3 tools/audit_confidentialite.py
python3 tools/audit_devinettes.py data/devinettes.json
```

Le dernier contrôle exige un catalogue réellement rempli : il ne doit pas être déclaré réussi si le fichier n'existe pas. L'audit de confidentialité doit actuellement signaler une erreur; c'est attendu jusqu'à correction du flux Firebase.

## Limites
Les tests statiques ne prouvent ni la sécurité des règles Firebase, ni le fonctionnement des salons en réseau. Ces points nécessitent une vérification réelle avec plusieurs comptes et navigateurs.
