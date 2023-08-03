# Guide


```
npm install https://github.com/aquabx/salles_esir#module
```

## Initialisation du module


```ts
import { salleEvents,salleLibres,getSalles } from "../includes/salles.ts";

(async function(){

    // Renvoie le status de toutes les salles dans la console
    for (let salle of await getSalles()) {

        let code = salle[2]
        let date = parseInt(Date.now()/1000) // le temps est en secondes ⚠️

        console.log( await salleLibres(code,date) )

    }

})()
```

## Les fonctions possibles


```ts

salleEvents(salles:string, date:number)

salleLibres(salles:string, date:number)

getSalles()

convert_unix_to_local(unix:Integer,local:String)

```
