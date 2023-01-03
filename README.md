# Exemples

---

## Initialisation du module


```ts

let salles = {"bat_salle_num":{"link":".../planning.shu"}}

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
