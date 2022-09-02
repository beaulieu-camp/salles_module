# Exemples

---

## Récupérer les états de chaques salles


```js
let module_salles = require("./module.js");

(async() => {
    let req = await fetch("https://github.com/AquaBx/salles_esir/blob/17283df4563557441af8f5d7d7c50904b5ef2dda/salles/data.json")
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
    let req = await fetch("https://github.com/AquaBx/salles_esir/blob/17283df4563557441af8f5d7d7c50904b5ef2dda/salles/data.json")
    let salles = await req.json()
    for ( let i in salles){
        let salle = salles[i]
        console.log( await module_salles.salleEvents(salle) )
    }
})()
```
