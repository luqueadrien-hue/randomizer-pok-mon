#!/usr/bin/env python3
"""Contrôles de non-régression des opérations atomiques sur les salons."""
from pathlib import Path
import sys
html=(Path(__file__).resolve().parents[1]/"index.html").read_text(encoding="utf-8")
tests={
 "Création atomique": "mpRoom(code).transaction(existing=>existing===null" in html,
 "Inscription atomique": "child('players').transaction(existing=>" in html,
 "Limite de 4": "filter(p=>p&&p.online!==false).length>=4" in html,
 "Refus code déjà pris": "if(!created.committed)" in html,
 "Refus salon complet": "if(!joined.committed)" in html,
 "Authentification obligatoire": "function mpAuthenticatedId()" in html and html.count("const id=mpAuthenticatedId();") >= 2,
 "Codes limités à 32 caractères": html.count("{1,32}") >= 2,
 "Reprise de session": "if(players[id]){await mpEnter(" in html,
 "Vérification identité à l’entrée": "if(s.id!==mpAuthenticatedId())" in html,
 "Interdiction de changer de salon sans quitter": "mpSession.room!==s.room" in html,
}
for label, ok in tests.items():print(("OK" if ok else "ÉCHEC")+": "+label)
print("Contrôle statique : vérifier les règles Firebase et tester deux navigateurs en parallèle.")
sys.exit(0 if all(tests.values()) else 1)
