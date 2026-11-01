# Randomizer Pokémon — jeux en réseau

Application web de défis Pokémon, avec salons Firebase et plusieurs modes de jeu. Le code principal est dans `index.html`.

## Marché des Dresseurs (bêta)

- **Huit rangs**, de 200 à 1 300 ₽, incluant les professeurs combattants.
- **604 occurrences historiques** dans le catalogue brut, correspondant à **358 identités espèce + forme distinctes**. Les neuf générations de Kanto à Paldea sont représentées, mais les équipes ne sont pas exhaustives.
- Filtrage par jeu de destination Switch (Écarlate/Violet, Épée/Bouclier, Diamant Étincelant/Perle Scintillante, Légendes Arceus) ; les DLC, les formes et les transferts HOME sont **partiellement couverts**.
- Budgets individuels, six achats maximum, stock commun exclusif et transactions Firebase côté client.
- Recherche par Pokémon, dresseur ou jeu source, avec liens de provenance.

**Attention : cette version n'est pas certifiée pour une partie réseau en production.** Les règles Firebase connues sont trop permissives, les données restent incomplètes et aucun test réel à deux navigateurs n'a été confirmé.

Documentation : [bilan du 1er novembre à 21 h](docs/marche-bilan-2026-11-01-21h.md) · [sécurité Firebase et migration requise](docs/firebase-marche-securite.md).

## Tests

```sh
node --test tests/trainer-market.test.mjs
```

Dix simulations de logique ont été exécutées avec succès dans un moteur JavaScript V8. Le workflow GitHub Actions est configuré, mais son exécution effective n'a pas été vérifiée. Les tests ne remplacent pas des essais réels avec Firebase, deux comptes et deux navigateurs.
