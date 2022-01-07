const axios = require('axios');

var link = {
    "amphi-l":"https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/KYNvDgYv.shu",
    "amphi-m":"https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/V3LwD2WA.shu",
    "amphi-n":"https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/XnmgOl3r.shu",
    "salle-001":"https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/pn82LL38.shu",
    "salle-002":"https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/qnqPZBYJ.shu",
    "salle-003":"https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/o356qeYR.shu",
    "salle-004":"https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/KW74qA3M.shu",
    "salle-101":"https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/134B51nk.shu",
    "salle-102":"https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/ynAw4b3w.shu",
    "salle-103":"https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/E3ejzdY5.shu",
    "salle-104":"https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/OnE5qdnr.shu"
}

var salles = ["amphi-l","amphi-m","amphi-n","salle-001","salle-002","salle-003","salle-004","salle-101","salle-102","salle-103","salle-104"]

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

function dichotomie(liste,datetime,a,b){
    if (b-a == 1){
        var test1 = to_date(liste[a]["DTEND"]) < datetime
        var test2 = datetime < to_date(liste[b]["DTSTART"])

        if (test1 && test2){
            return [true,liste[b]["DTSTART"]]
        }
        else{
            return [false,liste[a]["DTEND"]]
        }
         
    }
    var m = Math.floor((b+a)/2)
    if (datetime < to_date(liste[m]["DTSTART"])) {
        return dichotomie(liste,datetime,a,m)
    }
    else{
        return dichotomie(liste,datetime,m,b)
    }
}

function parse(data) {
    var data = data.split(" \r\n ").join("");
    data = data.split("\r\n ").join("");
    data = data.split(" \r\n").join("");
    data = data.split("\r\n");

    var obj =  [];
    var push =  {};
    for (var cle in data) {
        var valeur = data[cle]
        var split = valeur.split(':');
        var nkey = split[0];
        
        var nvalue = split.slice(1).join(" ");
        if (nkey == "BEGIN" && nvalue != "VCALENDAR"){
            push =  {};
        }
        else if (nkey == "END" && nvalue != "VCALENDAR"){
            obj.push(push);
        }
        else if (nkey == "END" && nvalue == "VCALENDAR"){
            break;
        }
        else if (nkey == "END" && nvalue == "VCALENDAR"){
            break;
        }
        else{
            push[nkey] = nvalue;
        }
    }
    return obj;
}

function main(salle){
    var url = link[salle]
    axios.get(url).then( function(response) {
        var cal = parse(response.data)
        cal.sort((a, b) => (a.DTEND > b.DTSTART) ? 1 : -1)
        var date = Date.now()
        var req = dichotomie(cal,date,0,cal.length)
        var state = req[0]
        var jusque = req[1]
        var offset = new Date().getTimezoneOffset();
        offset = offset*60*1000
        if (state){
            console.log(salle, "Libre jusque", new Date(to_date(jusque)-offset));
        }
        else{
            console.log(salle, "Occupé jusque", new Date(to_date(jusque)-offset) , "minimum");
        }
    })
}

function salleLibres(){
    for (var salle of salles){
        main(salle)
    }
}

exports.salleLibres = salleLibres;