'use strict';
const TD6_START_BUDGET=6000;
const TD6_RANK_PRICES={1:200,2:450,3:750,4:1000,5:1150,6:1500};
const TD6_RANKS=[{id:1,label:"Dresseurs ordinaires",icon:"🧢"},{id:2,label:"Spires d’organisation",icon:"🅁"},{id:3,label:"Champions d’Arène",icon:"🏅"},{id:4,label:"Rivaux",icon:"⚡"},{id:5,label:"Admins et chefs d’organisation",icon:"👑"},{id:6,label:"Conseil 4 et Maîtres de Ligue",icon:"🏆"}];
// Catégories de dresseurs officielles : les Pokémon restent des propositions aléatoires,
// et ne sont pas présentés comme les équipes canoniques de ces personnages.
const TD6_TRAINERS_BY_RANK={
 1:["Gamin","Fillette","Topdresseur"],
 2:["Sbire Team Rocket","Sbire Team Galaxie","Sbire Team Star"],
 3:["Éra","Colza","Mashynn","Kombu","Okuba","Laïm","Tully","Grusha"],
 4:["Menzi","Pepper","Blue","Silver","Tcheren"],
 5:["Giovanni","Hélio","Ghetis","Meloco","Brome","Nèflie"],
 6:["Alisma","Cayenn","Popi","Hassa","Cynthia","Tarak"]
};
const TD6_TRAINERS=Object.values(TD6_TRAINERS_BY_RANK).flat();
const TD6_POOL=[25,26,183,184,187,188,189,198,200,203,204,205,206,215,216,217,228,229,231,232,280,281,282,283,284,285,286,287,288,289,296,297,302,307,308,316,317,322,323,324,325,326,333,334,339,340,353,354,357,361,362,371,372,373,396,397,398,403,404,405,415,416,418,419,425,426,429,443,444,445,447,448,449,450,453,454,456,457,459,460,461,462,470,471,475,479,700];
const TD6_NATURES=["Hardi","Solo","Brave","Rigide","Mauvais","Assuré","Docile","Relax","Malin","Lâche","Timide","Pressé","Sérieux","Jovial","Naïf","Modeste","Doux","Discret","Foufou","Pudique","Calme","Gentil","Malpoli","Prudent","Bizarre"];
const TD6_TYPES=["normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy"];
const TD6_ITEMS=[["leftovers","Restes"],["sitrus-berry","Baie Sitrus"],["shell-bell","Grelot Coque"],["expert-belt","Ceinture Pro"]];
// Références de Pokémon utilisés par des catégories de dresseurs dans les jeux.
// Une entrée n'est admissible qu'avec une attribution explicite ; aucune déduction par puissance.
const TD6_LORE=[
 {
  "id": 19,
  "rank": 1,
  "trainer": "Gamin",
  "source": "Jeux Pokémon — rencontres de dresseurs ordinaires",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Youngster_(Trainer_class)",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 20,
  "rank": 1,
  "trainer": "Gamin",
  "source": "Jeux Pokémon — rencontres de dresseurs ordinaires",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Youngster_(Trainer_class)",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 16,
  "rank": 1,
  "trainer": "Gamin",
  "source": "Jeux Pokémon — rencontres de dresseurs ordinaires",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Youngster_(Trainer_class)",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 17,
  "rank": 1,
  "trainer": "Gamin",
  "source": "Jeux Pokémon — rencontres de dresseurs ordinaires",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Youngster_(Trainer_class)",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 10,
  "rank": 1,
  "trainer": "Gamin",
  "source": "Jeux Pokémon — rencontres de dresseurs ordinaires",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Youngster_(Trainer_class)",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 13,
  "rank": 1,
  "trainer": "Gamin",
  "source": "Jeux Pokémon — rencontres de dresseurs ordinaires",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Youngster_(Trainer_class)",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 25,
  "rank": 1,
  "trainer": "Gamin",
  "source": "Jeux Pokémon — rencontres de dresseurs ordinaires",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Youngster_(Trainer_class)",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 41,
  "rank": 1,
  "trainer": "Gamin",
  "source": "Jeux Pokémon — rencontres de dresseurs ordinaires",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Youngster_(Trainer_class)",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 74,
  "rank": 1,
  "trainer": "Gamin",
  "source": "Jeux Pokémon — rencontres de dresseurs ordinaires",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Youngster_(Trainer_class)",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 129,
  "rank": 1,
  "trainer": "Pêcheur",
  "source": "Jeux Pokémon — rencontres de dresseurs ordinaires",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Youngster_(Trainer_class)",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 19,
  "rank": 2,
  "trainer": "Sbire Team Rocket",
  "source": "Pokémon Rouge / Bleu — Team Rocket",
  "url": "https://www.pokepedia.fr/Team_Rocket",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 20,
  "rank": 2,
  "trainer": "Sbire Team Rocket",
  "source": "Pokémon Rouge / Bleu — Team Rocket",
  "url": "https://www.pokepedia.fr/Team_Rocket",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 23,
  "rank": 2,
  "trainer": "Sbire Team Rocket",
  "source": "Pokémon Rouge / Bleu — Team Rocket",
  "url": "https://www.pokepedia.fr/Team_Rocket",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 24,
  "rank": 2,
  "trainer": "Sbire Team Rocket",
  "source": "Pokémon Rouge / Bleu — Team Rocket",
  "url": "https://www.pokepedia.fr/Team_Rocket",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 27,
  "rank": 2,
  "trainer": "Sbire Team Rocket",
  "source": "Pokémon Rouge / Bleu — Team Rocket",
  "url": "https://www.pokepedia.fr/Team_Rocket",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 41,
  "rank": 2,
  "trainer": "Sbire Team Rocket",
  "source": "Pokémon Rouge / Bleu — Team Rocket",
  "url": "https://www.pokepedia.fr/Team_Rocket",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 42,
  "rank": 2,
  "trainer": "Sbire Team Rocket",
  "source": "Pokémon Rouge / Bleu — Team Rocket",
  "url": "https://www.pokepedia.fr/Team_Rocket",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 88,
  "rank": 2,
  "trainer": "Sbire Team Rocket",
  "source": "Pokémon Rouge / Bleu — Team Rocket",
  "url": "https://www.pokepedia.fr/Team_Rocket",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 109,
  "rank": 2,
  "trainer": "Sbire Team Rocket",
  "source": "Pokémon Rouge / Bleu — Team Rocket",
  "url": "https://www.pokepedia.fr/Team_Rocket",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 110,
  "rank": 2,
  "trainer": "Sbire Team Rocket",
  "source": "Pokémon Rouge / Bleu — Team Rocket",
  "url": "https://www.pokepedia.fr/Team_Rocket",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 95,
  "rank": 3,
  "trainer": "Pierre",
  "source": "Jeux Pokémon — combats de Champions",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 74,
  "rank": 3,
  "trainer": "Pierre",
  "source": "Jeux Pokémon — combats de Champions",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 120,
  "rank": 3,
  "trainer": "Ondine",
  "source": "Jeux Pokémon — combats de Champions",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 121,
  "rank": 3,
  "trainer": "Ondine",
  "source": "Jeux Pokémon — combats de Champions",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 130,
  "rank": 3,
  "trainer": "Ondine",
  "source": "Jeux Pokémon — combats de Champions",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 26,
  "rank": 3,
  "trainer": "Major Bob",
  "source": "Jeux Pokémon — combats de Champions",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 45,
  "rank": 3,
  "trainer": "Erika",
  "source": "Jeux Pokémon — combats de Champions",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 59,
  "rank": 3,
  "trainer": "Auguste",
  "source": "Jeux Pokémon — combats de Champions",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 94,
  "rank": 3,
  "trainer": "Mortimer",
  "source": "Jeux Pokémon — combats de Champions",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 208,
  "rank": 3,
  "trainer": "Jasmine",
  "source": "Jeux Pokémon — combats de Champions",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 448,
  "rank": 3,
  "trainer": "Cornélia",
  "source": "Jeux Pokémon — combats de Champions",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 700,
  "rank": 3,
  "trainer": "Valérie",
  "source": "Jeux Pokémon — combats de Champions",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 778,
  "rank": 3,
  "trainer": "Margie",
  "source": "Jeux Pokémon — combats de Champions",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 861,
  "rank": 3,
  "trainer": "Percy",
  "source": "Jeux Pokémon — combats de Champions",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 810,
  "rank": 4,
  "trainer": "Nabil",
  "source": "Pokémon Épée / Bouclier — Nabil",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Hop/Sword_and_Shield",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 811,
  "rank": 4,
  "trainer": "Nabil",
  "source": "Pokémon Épée / Bouclier — Nabil",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Hop/Sword_and_Shield",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 812,
  "rank": 4,
  "trainer": "Nabil",
  "source": "Pokémon Épée / Bouclier — Nabil",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Hop/Sword_and_Shield",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 813,
  "rank": 4,
  "trainer": "Nabil",
  "source": "Pokémon Épée / Bouclier — Nabil",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Hop/Sword_and_Shield",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 814,
  "rank": 4,
  "trainer": "Nabil",
  "source": "Pokémon Épée / Bouclier — Nabil",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Hop/Sword_and_Shield",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 815,
  "rank": 4,
  "trainer": "Nabil",
  "source": "Pokémon Épée / Bouclier — Nabil",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Hop/Sword_and_Shield",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 816,
  "rank": 4,
  "trainer": "Nabil",
  "source": "Pokémon Épée / Bouclier — Nabil",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Hop/Sword_and_Shield",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 817,
  "rank": 4,
  "trainer": "Nabil",
  "source": "Pokémon Épée / Bouclier — Nabil",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Hop/Sword_and_Shield",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 818,
  "rank": 4,
  "trainer": "Nabil",
  "source": "Pokémon Épée / Bouclier — Nabil",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Hop/Sword_and_Shield",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 831,
  "rank": 4,
  "trainer": "Nabil",
  "source": "Pokémon Épée / Bouclier — Nabil",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Hop/Sword_and_Shield",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 832,
  "rank": 4,
  "trainer": "Nabil",
  "source": "Pokémon Épée / Bouclier — Nabil",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Hop/Sword_and_Shield",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 821,
  "rank": 4,
  "trainer": "Nabil",
  "source": "Pokémon Épée / Bouclier — Nabil",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Hop/Sword_and_Shield",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 822,
  "rank": 4,
  "trainer": "Nabil",
  "source": "Pokémon Épée / Bouclier — Nabil",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Hop/Sword_and_Shield",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 823,
  "rank": 4,
  "trainer": "Nabil",
  "source": "Pokémon Épée / Bouclier — Nabil",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Hop/Sword_and_Shield",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 143,
  "rank": 4,
  "trainer": "Nabil",
  "source": "Pokémon Épée / Bouclier — Nabil",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Hop/Sword_and_Shield",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 871,
  "rank": 4,
  "trainer": "Nabil",
  "source": "Pokémon Épée / Bouclier — Nabil",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Hop/Sword_and_Shield",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 53,
  "rank": 5,
  "trainer": "Giovanni",
  "source": "Jeux Pokémon — chefs d'organisations",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Giovanni",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 51,
  "rank": 5,
  "trainer": "Giovanni",
  "source": "Jeux Pokémon — chefs d'organisations",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Giovanni",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 34,
  "rank": 5,
  "trainer": "Giovanni",
  "source": "Jeux Pokémon — chefs d'organisations",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Giovanni",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 31,
  "rank": 5,
  "trainer": "Giovanni",
  "source": "Jeux Pokémon — chefs d'organisations",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Giovanni",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 112,
  "rank": 5,
  "trainer": "Giovanni",
  "source": "Jeux Pokémon — chefs d'organisations",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Giovanni",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 111,
  "rank": 5,
  "trainer": "Giovanni",
  "source": "Jeux Pokémon — chefs d'organisations",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Giovanni",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 105,
  "rank": 5,
  "trainer": "Giovanni",
  "source": "Jeux Pokémon — chefs d'organisations",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Giovanni",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 130,
  "rank": 5,
  "trainer": "Giovanni",
  "source": "Jeux Pokémon — chefs d'organisations",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Giovanni",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 229,
  "rank": 5,
  "trainer": "Hélio",
  "source": "Jeux Pokémon — chefs d'organisations",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Giovanni",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 461,
  "rank": 5,
  "trainer": "Hélio",
  "source": "Jeux Pokémon — chefs d'organisations",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Giovanni",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 430,
  "rank": 5,
  "trainer": "Hélio",
  "source": "Jeux Pokémon — chefs d'organisations",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Giovanni",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 635,
  "rank": 5,
  "trainer": "Ghetis",
  "source": "Jeux Pokémon — chefs d'organisations",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Giovanni",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 625,
  "rank": 5,
  "trainer": "Ghetis",
  "source": "Jeux Pokémon — chefs d'organisations",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Giovanni",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 563,
  "rank": 5,
  "trainer": "Ghetis",
  "source": "Jeux Pokémon — chefs d'organisations",
  "url": "https://bulbapedia.bulbagarden.net/wiki/Giovanni",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 149,
  "rank": 6,
  "trainer": "Peter",
  "source": "Jeux Pokémon — Conseil 4 et Maîtres",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 130,
  "rank": 6,
  "trainer": "Peter",
  "source": "Jeux Pokémon — Conseil 4 et Maîtres",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 94,
  "rank": 6,
  "trainer": "Agatha",
  "source": "Jeux Pokémon — Conseil 4 et Maîtres",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 131,
  "rank": 6,
  "trainer": "Olga",
  "source": "Jeux Pokémon — Conseil 4 et Maîtres",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 68,
  "rank": 6,
  "trainer": "Aldo",
  "source": "Jeux Pokémon — Conseil 4 et Maîtres",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 445,
  "rank": 6,
  "trainer": "Cynthia",
  "source": "Jeux Pokémon — Conseil 4 et Maîtres",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 448,
  "rank": 6,
  "trainer": "Cynthia",
  "source": "Jeux Pokémon — Conseil 4 et Maîtres",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 407,
  "rank": 6,
  "trainer": "Cynthia",
  "source": "Jeux Pokémon — Conseil 4 et Maîtres",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 350,
  "rank": 6,
  "trainer": "Cynthia",
  "source": "Jeux Pokémon — Conseil 4 et Maîtres",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 392,
  "rank": 6,
  "trainer": "Adrien",
  "source": "Jeux Pokémon — Conseil 4 et Maîtres",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 467,
  "rank": 6,
  "trainer": "Adrien",
  "source": "Jeux Pokémon — Conseil 4 et Maîtres",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 681,
  "rank": 6,
  "trainer": "Thyméo",
  "source": "Jeux Pokémon — Conseil 4 et Maîtres",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 706,
  "rank": 6,
  "trainer": "Tarak",
  "source": "Jeux Pokémon — Conseil 4 et Maîtres",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 6,
  "rank": 6,
  "trainer": "Tarak",
  "source": "Jeux Pokémon — Conseil 4 et Maîtres",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 887,
  "rank": 6,
  "trainer": "Tarak",
  "source": "Jeux Pokémon — Conseil 4 et Maîtres",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 282,
  "rank": 6,
  "trainer": "Dianthéa",
  "source": "Jeux Pokémon — Conseil 4 et Maîtres",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 },
 {
  "id": 671,
  "rank": 6,
  "trainer": "Dianthéa",
  "source": "Jeux Pokémon — Conseil 4 et Maîtres",
  "url": "https://www.poketools.com/gym-teams",
  "note": "Association issue des équipes ou rencontres du support cité — à auditer individuellement"
 }
];
function td6LoreFor(id,rank){return TD6_LORE.filter(x=>x.id===id&&x.rank===rank)}
function td6Shuffle(input,rng=Math.random){const a=[...input];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function td6Create(offers,previous,rng=Math.random,game='sv'){
 if(!Array.isArray(offers)||offers.length<18)throw Error("Il faut 18 Pokémon validés.");
 const unique=new Map(offers.map(x=>[x.id,x]));if(unique.size<18)throw Error("Il faut 18 espèces distinctes.");
 let trainers,selected,signature;
 for(let attempt=0;attempt<8;attempt++){
  trainers=TD6_RANKS.slice().reverse().map(rank=>td6Shuffle(TD6_TRAINERS_BY_RANK[rank.id],rng)[0]);
  selected=[];
  for(const rank of TD6_RANKS.slice().reverse()){
   const pool=td6Shuffle([...unique.values()].filter(p=>td6LoreFor(p.id,rank.id).length&&!selected.some(x=>x.id===p.id)),rng);
   if(pool.length<3)throw Error('Catalogue lore insuffisant pour le rang '+rank.id+' : '+pool.length+'/3 Pokémon documentés. Aucun Pokémon ne sera classé arbitrairement.');
   selected.push(...pool.slice(0,3).map(p=>({...p,lore:td6LoreFor(p.id,rank.id)[0]})));
  }
  signature=trainers.join("|")+"#"+selected.map(x=>x.id).join(",");
  if(signature!==previous?.signature)break;
 }
 return {version:1,game,gameId:"",budget:TD6_START_BUDGET,signature,trainers,offers:trainers.map((trainer,i)=>({trainer,rank:TD6_RANKS[5-i],pokemon:selected.slice(i*3,i*3+3)})),choices:{"1":{gameId:"",entries:[]},"2":{gameId:"",entries:[]}},created:Date.now()};
}
function td6AddChoice(state,seat,trainerIndex,offerIndex,custom){
 if(!state||state.version!==1||!["sv","swsh","bdsp"].includes(state.game)||![1,2].includes(Number(seat)))throw Error("Partie invalide.");
 const current=state.choices?.[seat]||state.choices?.[String(seat)];
 if(!current||current.gameId!==state.gameId||(current.entries!=null&&!Array.isArray(current.entries)))throw Error("Partie modifiée : recharge les choix.");
 const entries=Array.isArray(current.entries)?current.entries:[];
 if(entries.length>=6)throw Error("Les six manches sont terminées.");
 if(!Number.isInteger(trainerIndex)||trainerIndex<0||trainerIndex>5||!Number.isInteger(offerIndex)||offerIndex<0||offerIndex>2)throw Error("Proposition inconnue.");
 if(entries.some(e=>e.trainerIndex===trainerIndex))throw Error("Dresseur déjà utilisé par ce joueur.");
 // Les propositions sont communes, mais chaque joueur dispose de son propre droit de sélection.
 // Un choix de l'autre joueur ne doit jamais réserver une case globalement.
 const offer=state.offers?.[trainerIndex]?.pokemon?.[offerIndex];
 if(!offer||!Array.isArray(offer.legalMoves)||offer.legalMoves.length<4)throw Error("Pokémon sans données légales.");
 const moves=custom?.moves;
 if(!Array.isArray(moves)||moves.length!==4||new Set(moves).size!==4||moves.some(m=>!offer.legalMoves.includes(m)))throw Error("Les quatre capacités doivent être distinctes et légales.");
 if(!TD6_NATURES.includes(custom?.nature))throw Error("Nature invalide.");
 if(!TD6_TYPES.includes(custom?.tera))throw Error("Type Téracristal invalide.");
 const price=TD6_RANK_PRICES[state.offers[trainerIndex].rank?.id]||0;
 const spent=entries.reduce((sum,e)=>sum+(e.price||TD6_RANK_PRICES[state.offers[e.trainerIndex]?.rank?.id]||0),0);
 if(spent+price>(state.budget||TD6_START_BUDGET))throw Error("Budget de Pokédollars insuffisant.");
 const entry={trainerIndex,offerIndex,price,pokemonId:offer.id,moves:[...moves],nature:custom.nature,tera:custom.tera};
 return {gameId:state.gameId,entries:[...entries,entry]};
}
const TrainerDraftCore={TD6_LORE,td6LoreFor,TD6_START_BUDGET,TD6_RANK_PRICES,TD6_RANKS,TD6_TRAINERS,TD6_TRAINERS_BY_RANK,TD6_POOL,TD6_NATURES,TD6_TYPES,TD6_ITEMS,td6Shuffle,td6Create,td6AddChoice};
if(typeof module!=='undefined'&&module.exports)module.exports=TrainerDraftCore;
if(typeof window!=='undefined')window.TrainerDraftCore=TrainerDraftCore;
