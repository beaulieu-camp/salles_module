let base_url = "https://beaulieu-camp.github.io/salles"

type Event = [number,number,string]

function checkafter(liste:Event[],i:number){
    let b = i+1
    while ( liste[b] !== undefined && liste[i][1] === liste[b][0] ) {
        i += 1
        b = i+1
    }
    return i
}

function dichotomie(liste:Event[],datetime:number,a:number,b:number) : [boolean,number]{
    /*

        Renvoie [x,y] 
        
        x : booléen -> si la salle est prise true, sinon false
        y : number -> date a laquelle la salle ce statut change
      
    */
   
    if (b-a <= 1){
        var test0 = datetime < liste[a][0] 
        var test1 = liste[a][1] < datetime
        var test2 = datetime < liste[b][0]
        var test3 = liste[b][1] < datetime // cas out of bound1
        

        if (test0){
            return [false,a]
        }
        else if (test1 && test2){
            return [false,b]
        }
        else if (test3) {
            return [true,-1]
        }
        else{
            return [true,a]
        }
         
    }
    var m = Math.floor((b+a)/2)
    if (datetime < liste[m][1]) {
        return dichotomie(liste,datetime,a,m)
    }
    else{
        return dichotomie(liste,datetime,m,b)
    }
}

export async function salleLibres(salle:string,date:number){
    /*
        Retourne si la salle est libre (true) ou non (false) sur 

        date est par défaut Date.now()

        Args : 
            - salle : string
            - date : int (UNIX time) en secondes
        Return :
            - return.state : booléen : état de la salle ( libre : true , occupé : false )
            - return.until : int : date de fin de l'état (UNIX time)
    */

    let cal = await ( await fetch(base_url + "/" + salle + ".json") ).json()


    var req = dichotomie(cal, date,0,cal.length-1 )
    var state = req[0]    
    var i = req[1]
    if (i == -1) {
        return {"error":"Calendrier pas à jour"}
    }
    console.log(state)
    if (state){
        i = checkafter(cal,i) // vérification des évenements collés 
        return {"state":"Occupé","until":cal[i][1]}
    }
    else{
        return {"state":"Libre","until":cal[i][0]}
    }

}

export async function salleEvents(salle:string,date:number){
    /*
        Retourne les horaires des cours/events d'une journée donnée dans une salle donnée
        
        Args:
            - salle : string
            - date : int (UNIX time) en secondes
        return : 
            - liste des events d'une journée
    */
    
    let cal = await ( await fetch(base_url + "/" + salle + ".json") ).json()

    var req = dichotomie(cal,date,0,cal.length-1)  
    var i = req[1]

    var liste = []
    while (cal[i][1] < date + 24*60*60){
        liste.push(cal[i])
        i+=1
    }
    return liste
}

export function convert_unix_to_local(unix:number){
    var offset = new Date().getTimezoneOffset();
    offset = offset*60*1000
    return new Date(unix-offset)
}

export async function getSalles(){
    return await ( await fetch(base_url + "/salles.json") ).json()
}
