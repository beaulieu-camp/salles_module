# Guide

⚠️ Un fichier `.db` doit être initialisé pour l'instant

---

```
npm install https://github.com/aquabx/salles_esir#module
```

## Initialisation du module


```ts
const plannings = require("plannings");

let salles = {"batiment_salle_numero":{"link":".../planning.shu"}}

let myplannings = new plannings.default(salles,"database.db")

```

---

## Les variables disponibles


```ts

myplannings.loaded // stocke les promesses de chaque mise à jour de salle

myplannings.database // stocke l'instance de la base de donnée

myplannings.salles // stocke les salles

```

## Les fonctions possibles


```ts

myplannings.salleEvents(salles:String[], callback:function, date:Integer)

myplannings.salleLibres(salles:String[], callback:function, date:Integer)

myplannings.convert_unix_to_local(unix:Integer,local:String)

```
