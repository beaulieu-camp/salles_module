# Salles ESIR

---

## Modules

Le module "module_salles.js" permet de renvoyer des informations pratiques sur les emplois du temps des salles de l'ESIR

| Nom de l'export | Description |
| --- | --- |
| exports.salleLibres | appelle la fonction qui renvoie les états d'une salle en ce momment |
| exports.salleEvents | appelle la fonction qui renvoie les événement d'une salle durant une journée |
| exports.convert_unix_to_local | renvoie la date dans le fuseau horaire locale d'un temps UNIX |
| exports.salles | renvoie une liste des salles possibles |
| exports.salles_links | renvoie un dictionnaire des liens des emplois du temps des salles |
| exports.salles_names | renvoie un dictionnaire des noms des salles |


Le module "module_bu.js" permet de renvoyer des informations sur les horaires d'ouvertures des Bibliothèques unniversitaires

---

## Bot

Le bot "bot.js" est un bot discord basé sur discordjs et qui utilise les fonctionnalités du module "main.js"

### Dependencies

`$ npm install discord.js`
`$ npm install axios`

### How to use

#### Step 1

`$ nano token.json` and parse :
```
{
    "token" : "your bot's token"
}
```

#### Step 2

`$ node bot.js`
or
`$ pm2 start bot.js`

---
