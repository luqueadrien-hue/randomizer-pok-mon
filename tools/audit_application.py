#!/usr/bin/env python3
"""Contrôles statiques non destructifs de l'application HTML."""
from pathlib import Path
import re, sys

source = Path(__file__).resolve().parents[1] / "index.html"
html = source.read_text(encoding="utf-8")
checks = {
    "Document HTML": "<!doctype html>" in html.lower(),
    "SDK Firebase": "firebase-database-compat.js" in html,
    "Authentification Firebase": "signInAnonymously()" in html,
    "Création de salon": "async function mpCreateRoom()" in html,
    "Rejoindre un salon": "async function mpJoinRoom()" in html,
    "Rébus phonétique": 'value="phoneticrebus"' in html,
    "Vue privée du générateur": "isGenerator" in html,
    "Mode de rendu": "function render()" in html,
    "Bouton création connecté": "mpCreate.addEventListener('click'" in html,
}
for name, ok in checks.items():
    print(("OK" if ok else "MANQUANT") + " : " + name)
# Une présence de code ne prouve pas son fonctionnement ou sa confidentialité.
print("ATTENTION: contrôle statique uniquement; aucun test navigateur, Firebase ou sécurité.")
sys.exit(0 if all(checks.values()) else 1)
