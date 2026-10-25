#!/usr/bin/env python3
"""Audit non destructif du catalogue des devinettes Pokémon.
Usage: python3 tools/audit_devinettes.py data/devinettes.json
Format attendu: liste d'objets {pokemon_id, form_id, games: {phonetic, characteristics, objects}}.
Chaque game contient {elements: [2 ou 3 descriptions], solution: texte}.
L'absence de fichier ou de couverture complète provoque un échec explicite.
"""
import json, sys
from collections import Counter
from pathlib import Path

GAMES = ("phonetic", "characteristics", "objects")
def audit(path):
    rows = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(rows, list):
        raise ValueError("La racine doit être une liste")
    issues = []
    keys = []
    species = set()
    for i, row in enumerate(rows, 1):
        pid = row.get("pokemon_id")
        form = str(row.get("form_id", "base"))
        if not isinstance(pid, int) or not 1 <= pid <= 1025:
            issues.append(f"Ligne {i}: pokemon_id invalide: {pid!r}")
            continue
        species.add(pid)
        keys.append((pid, form))
        for game in GAMES:
            entry = row.get("games", {}).get(game)
            if not isinstance(entry, dict):
                issues.append(f"#{pid} {form}: jeu {game} absent")
                continue
            elements = entry.get("elements")
            if not isinstance(elements, list) or len(elements) not in (2, 3) or not all(isinstance(x, str) and x.strip() for x in elements):
                issues.append(f"#{pid} {form}: {game} exige 2 ou 3 éléments non vides")
            if not isinstance(entry.get("solution"), str) or not entry["solution"].strip():
                issues.append(f"#{pid} {form}: {game} sans solution")
    duplicates = [k for k, n in Counter(keys).items() if n > 1]
    missing = sorted(set(range(1, 1026)) - species)
    if duplicates: issues.append(f"Entrées en double: {duplicates[:20]}")
    if missing: issues.append(f"Espèces absentes ({len(missing)}): {missing}")
    print(f"Espèces: {len(species)}/1025; entrées formes incluses: {len(rows)}; erreurs: {len(issues)}")
    for issue in issues[:100]: print("ERREUR:", issue)
    if len(issues) > 100: print(f"... {len(issues)-100} erreurs supplémentaires")
    return not issues

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 tools/audit_devinettes.py <catalogue.json>")
        sys.exit(2)
    try:
        sys.exit(0 if audit(sys.argv[1]) else 1)
    except (OSError, ValueError, TypeError, json.JSONDecodeError) as exc:
        print("AUDIT IMPOSSIBLE:", exc)
        sys.exit(2)
