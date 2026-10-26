#!/usr/bin/env python3
"""Audit de confidentialité : détecte les réponses envoyées au salon Firebase.

Ce test échoue volontairement tant que les propositions secrètes sont publiées
sous rooms/<code>/state/current. Masquer une réponse en HTML n'est pas une
protection : tout participant ayant accès à l'état peut lire les identifiants.
"""
from pathlib import Path
import re
import sys

html = (Path(__file__).resolve().parents[1] / "index.html").read_text(encoding="utf-8")
start = html.find("async function mpSnapshot()")
end = html.find("async function mpSyncState()", start)
if start < 0 or end < 0:
    print("ÉCHEC : impossible de localiser mpSnapshot/mpSyncState")
    sys.exit(1)
snapshot = html[start:end]
issues = []
if re.search(r"current\s*:\s*current\.map\(", snapshot):
    for field in ("pokemonId", "isLie", "lieText", "musicAnswer"):
        if re.search(r"\b" + field + r"\s*:", snapshot):
            issues.append(f"Le champ {field} est potentiellement envoyé à tous les joueurs.")
if re.search(r"child\(['\"]state['\"]\)\.set\(", html):
    print("INFO : état de manche diffusé dans le salon Firebase.")
if issues:
    for issue in issues:
        print("ÉCHEC CONFIDENTIALITÉ :", issue)
    print("Correction requise : publier uniquement des indices publics; conserver les réponses dans un espace privé protégé par des règles Firebase côté serveur.")
    sys.exit(1)
print("Aucun des champs sensibles recherchés dans mpSnapshot (contrôle statique uniquement).")
