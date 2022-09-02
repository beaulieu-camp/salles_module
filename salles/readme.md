# Exemples

---

## Récupérer les états de chaques salles


```js
let module_salles = require("./module.js");

(async() => {
    let req = await fetch("https://raw.githubusercontent.com/AquaBx/salles_esir/main/salles/readme.md")
    let salles = await req.json()
    for ( let i in salles){
        let salle = salles[i]
        console.log( await module_salles.salleLibres(salle) )
    }
})()
```

---

## Récupérer les évènements de chaques salles


```js
let module_salles = require("./module.js");

(async() => {
    let req = await fetch("https://raw.githubusercontent.com/AquaBx/salles_esir/main/salles/readme.md")
    let salles = await req.json()
    for ( let i in salles){
        let salle = salles[i]
        console.log( await module_salles.salleEvents(salle) )
    }
})()
```
