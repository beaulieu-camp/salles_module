# Salles ESIR

---

## Module

Le module "main.js" permet de renvoyer des informations pratiques sur les emplois du temps des salles de l'ESIR

| Nom de l'export | Description |
| --- | --- |
| exports.salleLibres | appelle la fonction qui renvoie les états d'une salle en ce momment |
| exports.salleEvents | appelle la fonction qui renvoie les événement d'une salle durant une journée |
| exports.convert_unix_to_local | renvoie la date dans le fuseau horaire locale d'un temps UNIX |
| exports.salles | renvoie une liste des salles possibles |
| exports.salles_links | renvoie un dictionnaire des liens des emplois du temps des salles |

---

## Bot

Le bot "bot.js" est un bot discord basé sur discordjs et qui utilise les fonctionnalités du module "main.js"

---
