const axios = require('axios');

function to_date(char){
    var year = char.slice(0,4)
    var month = char.slice(4,6)
    var day = char.slice(6,8)
    var hour = char.slice(9,11)
    var minute = char.slice(11,13)
    var sec = char.slice(13,15)
    var date = new Date(Date.UTC(year,parseInt(month)-1,day,parseInt(hour),minute,sec))
    return date.getTime()
}

function checkafter(a,liste){
    let b = a+1

    while ( liste[a]["end"] === liste[b]["start"] ) {
        a += 1
        b = a+1
    }
    return a

}

function dichotomie(liste,datetime,a,b){
    while (b-a > 1) {
        let m = Math.floor( (b+a)/2 );
        if (datetime < liste[m]["start"]) {
            b = m;
        }
        else{
            a = m;
        }
    }

    if (datetime < liste[a]["start"]){ // apres le planning
        return [undefined, "Les plannings sont en avance" ];
    }
    
    if (datetime > liste[b]["end"]){ // avant le planning
        return [undefined, "Les plannings ne sont pas à jour" ]
    } 


    let test1 = liste[a]["end"] < datetime;
    let test2 = datetime < liste[b]["start"];

    if (test1 && test2){
        	return [true,b];
    }
    else{
        let na = checkafter(a,liste)
        return [false,na];
    }
}

function parse(data) {
    data = data.split("\r\n");

    let obj =  [];
    let nlist = {}
    for (let cle in data) {

        let valeur = data[cle]
        let split = valeur.split(':');
        let nkey = split[0];
        
        if (nkey == "DTSTART" ){
            nlist["start"] = to_date(split[1])
        }
        else if (nkey == "DTEND"){
            nlist["end"] = to_date(split[1])
        }
        else if (nkey == "DESCRIPTION"){
            nlist["description"] = split[1]
        }

        if (Object.keys(nlist).length === 3){
            obj.push(nlist)
            nlist = {}

        }
    }
    return obj;
}

async function request(url){
    const resp = await axios.get(url);
    return await resp.data;
};

async function get_cal(url){
    var resp = await request(url);
    var cal = parse(resp)
    cal.sort((a, b) => (a["end"] > b["start"]) ? 1 : -1)
    return cal
}

async function salleLibres(salle,date=Date.now()){

    /*
        Retourne si la salle est libre (true) ou non (false) sur 

        date est par défaut Date.now()

        Args : 
            - salle : string
            - date : int (UNIX time)
        Return :
            - return.state : booléen : état de la salle ( libre : true , occupé : false )
            - return.until : int : date de fin de l'état (UNIX time)
    */
    var url = salle["link"]
    var cal = await get_cal(url);
    var req = dichotomie(cal,date,0,cal.length-1)
    var state = req[0]    
    var i = req[1]
    
    if ( state === undefined ) {
        return {"error":i}
    }

    if (state){
        var jusque = cal[i]["start"]
    }
    else{
        var jusque = cal[i]["end"]
    }
    return {"state":state,"until":jusque}
}

async function salleEvents(salle,date){
    /*
        Retourne les horaires des cours/events d'une journée donnée dans une salle donnée
        
        Args:
            - salle : string
            - date : int (UNIX time)
        return : 
            - liste des events d'une journée
    */

    date = new Date(date).setHours(0)
    date = new Date(date).setMinutes(0)
    date = new Date(date).setSeconds(0)
    
    var url = salle["link"]
    var cal = await get_cal(url);
    var req = dichotomie(cal,date,0,cal.length-1)  
    var state = req[0]
    var i = req[1]

    if ( state === undefined ) {
        return {"error":i}
    }

    var liste = []
    while (cal[i]["end"] < date + 24*60*60*1000){
        liste.push(cal[i])
        i+=1
    }
    return liste
}

function convert_unix_to_local(unix,local="fr-FR"){
    var date = new Date(unix)
    return date.toLocaleDateString(local, {weekday: "long", day: "numeric", hour: "numeric", minute: "numeric"})
}

async function exemple(salles){
    console.log("Salles Libres")

    for (var salle in salles){
        var resp = await salleLibres(salles[salle])
        if (resp.error){
            console.log(resp.error)
        }
        else{
            console.log(salle, "Libre ?",resp.state, convert_unix_to_local(resp.until));
        }
    }
    console.log("Salles Events")
    for (var salle in salles){
        if (resp.error){
            console.log(resp.error)
        }
        else{
            var date = new Date(Date.UTC(2022,0,10))
            date = date.getTime()
            var resp = await salleEvents(salles[salle],date)
            console.log(salle, resp);
        }
    }
}

let module_salles = class {
    static salleLibres = salleLibres
    static salleEvents = salleEvents
    static convert_unix_to_local = convert_unix_to_local
    static exemple = exemple
}

if (typeof exports === 'object' && typeof module !== 'undefined') { 
    module.exports = module_salles; 
}
