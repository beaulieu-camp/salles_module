# Guide

⚠️ Un fichier `.db` doit être initialisé pour l'instant

---

## Initialisation du module


```ts

let salles = {"batiment_salle_numero":{"link":".../planning.shu"}}

let module_salles = require("./module.js");

let myplannings = new module_salles(salles,"database.db")

```

---

## Les fonctions possibles


```ts

myplannings.salleEvents(salles:String[], callback:function, date:Integer)

myplannings.salleLibres(salles:String[], callback:function, date:Integer)

myplannings.convert_unix_to_local(unix:Integer,local:String)

```
