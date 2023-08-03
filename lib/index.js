"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalles = exports.convert_unix_to_local = exports.salleEvents = exports.salleLibres = void 0;
let base_url = "https://beaulieu-camp.github.io/api";
function checkafter(liste, i) {
    let b = i + 1;
    while (liste[b] !== undefined && liste[i][1] === liste[b][0]) {
        i += 1;
        b = i + 1;
    }
    return i;
}
function dichotomie(liste, datetime, a, b) {
    /*

        Renvoie [x,y]
        
        x : booléen -> si la salle est prise true, sinon false
        y : number -> date a laquelle la salle ce statut change
      
    */
    if (b - a == 1) {
        var test1 = liste[a][0] < datetime;
        var test2 = datetime < liste[b][1];
        if (test1 && test2) {
            return [true, b];
        }
        else {
            return [false, a];
        }
    }
    var m = Math.floor((b + a) / 2);
    if (datetime < liste[m][1]) {
        return dichotomie(liste, datetime, a, m);
    }
    else {
        return dichotomie(liste, datetime, m, b);
    }
}
async function salleLibres(salle, date) {
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
    let cal = await (await fetch(base_url + "/" + salle + ".json")).json();
    var req = dichotomie(cal, date, 0, cal.length);
    var state = req[0];
    var i = req[1];
    if (state) {
        i = checkafter(cal, i); // vérification des évenements collés 
        return { "state": "Occupé", "until": cal[i][1] };
    }
    else {
        return { "state": "Libre", "until": cal[i][0] };
    }
}
exports.salleLibres = salleLibres;
async function salleEvents(salle, date) {
    /*
        Retourne les horaires des cours/events d'une journée donnée dans une salle donnée
        
        Args:
            - salle : string
            - date : int (UNIX time) en secondes
        return :
            - liste des events d'une journée
    */
    let cal = await (await fetch(base_url + "/" + salle + ".json")).json();
    var req = dichotomie(cal, date, 0, cal.length - 1);
    var i = req[1];
    var liste = [];
    while (cal[i][1] < date + 24 * 60 * 60) {
        liste.push(cal[i]);
        i += 1;
    }
    return liste;
}
exports.salleEvents = salleEvents;
function convert_unix_to_local(unix) {
    var offset = new Date().getTimezoneOffset();
    offset = offset * 60 * 1000;
    return new Date(unix - offset);
}
exports.convert_unix_to_local = convert_unix_to_local;
async function getSalles() {
    return await (await fetch(base_url + "/salles.json")).json();
}
exports.getSalles = getSalles;
