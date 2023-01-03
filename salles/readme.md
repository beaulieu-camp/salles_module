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

myplannings.salleEvents(salles:string[], callback:function, date:int)

myplannings.salleLibres(salles:string[], callback:function, date:int)

myplannings.convert_unix_to_local(unix:int,local:string)

```
