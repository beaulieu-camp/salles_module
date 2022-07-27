# How to use

```js
let module_salles = require("./module.js");

(async() => {
    let req = await fetch("https://cdn.jsdelivr.net/gh/AquaBx/salles_esir@latest/salles/data.json")
    let salles = await req.json()
    for ( let i in salles){
        let salle = salles[i]
        console.log( await module_salles.salleLibres(salle) )
    }
})()
```
