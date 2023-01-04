const cron = require("node-cron");
const sqlite3 = require('sqlite3').verbose();

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

function checkafter(liste,i=0){
    let b = a+1
    while ( liste[b] !== undefined && liste[a]["end"] === liste[b]["start"] ) {
        a += 1
        b = a+1
    }
    return a
}

function parse(data) {
    data = data.replaceAll("\r\n ","").split("\r\n");
    let obj =  [];
    let nlist = {}
    for (let cle in data) {

        let valeur = data[cle]
        let split = valeur.split(':');
        let nkey = split[0];
        let val = split.slice(1).join(":");

        if (nkey == "DTSTART" ){
            nlist["start"] = to_date(val)
        }
        else if (nkey == "DTEND"){
            nlist["end"] = to_date(val)
        }
        else if (nkey == "DESCRIPTION"){
            nlist["description"] = val
        }
        else if (nkey == "SUMMARY"){
            nlist["summary"] = val
        }
	    else if (nkey == "UID"){
            nlist["uid"] = val
        }

        if (Object.keys(nlist).length === 5){
            obj.push(nlist)
            nlist = {}

        }
    }
    return obj;
}

async function actualize_salles(db,salles) {
    for ( let key in salles){
        let salle = salles[key]
        let name = key

        let url = salle.link
        let req = await fetch(url)

        if (req.status !== 200) { console.log("error: ",req.status); continue }
        let text = await req.text()
        let cal = await parse( text )

        reset(db,name)

        for (let event of cal) {
            let start = event.start
            let end = event.end
            let uid = event.uid
            let summary = event.summary.replace(/\'/g,"''")
            let description = event.description.replace(/\'/g,"''")
            let sql = `INSERT INTO ${name} (uid,salle, start, end, summary, description) VALUES ('${uid}','${name}',${start},${end},'${summary}','${description}')`
            serialize(db,sql)
        }
	   console.log( `update_${name}_finished` )
    }
}

function salleLibres(salles,callback,date=Date.now(),results={},db=this.database) {
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

    if (salles.length === 0 ) { return callback(results) }

    let salle = salles.pop()
    let sql = `SELECT * FROM ${salle} WHERE start>=${date} ORDER BY start ASC`

    read_db(db,sql, (data) => {
        if ( date < data[0]["start"] ) { 
            results[salle] = { state : true, until: data[0]["start"] }
        }
        else {
            let i = checkafter(data) 
            results[salle] = { state : false, until: data[i]["end"] }
        }

        salleLibres(salles,callback,date,results,db)
    })
}

function salleEvents(salles,callback,date=Date.now(),results={},db=this.database) {
    /*
        Retourne les horaires des cours/events d'une journée donnée dans une salle donnée
        
        Args:
            - salle : string
            - date : int (UNIX time)
        return : 
            - liste des events d'une journée
    */
    if ( salles.length === 0 ) { return callback(results) }

    let min_date1 = (new Date(date)).setHours(0)
    let min_date2 = (new Date(min_date1)).setMinutes(0)
    let min_date3 = (new Date(min_date2)).setSeconds(0)
    let max_date = date + 24*60*60*1000
    
    let salle = salles.pop()
    let sql = `SELECT * FROM ${salle} WHERE (start>=${min_date3}) AND (end<=${max_date}) ORDER BY start ASC`

    read_db(db,sql, (data) => {
        results[salle] = data

        salleEvents(salles,callback,date,results,db)
    })
}

function convert_unix_to_local(unix,local="fr-FR"){
    var date = new Date(unix)
    return date.toLocaleDateString(local, {weekday: "long", day: "numeric", hour: "numeric", minute: "numeric"})
}

function close_db(db){
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
    });
}

function read_db(db,sql_command,callback) {
    db.all(sql_command, (err, rows) => {
        if (err) console.error(err.message, sql_command);
        else callback(rows)
    })
}

function serialize(db,sql){
    db.serialize(() => {
        db.each(sql, 
         (err, row) => {
             if (err) {
                console.error(err.message, sql);
             }
           }
        );
     });
}

function reset(db,salle){
    
    let sql = `
    DROP TABLE ${salle};
    `
    let sql2 =`
    CREATE TABLE ${salle}
    (
        uid VARCHAR(60),
        salle VARCHAR(30),
        start INT,
        end INT,
        summary VARCHAR(100),
        description VARCHAR(255)
    )`
    try{
        serialize(db,sql)
    } catch(e){}
    serialize(db,sql2)
}


if (typeof exports === 'object' && typeof module !== 'undefined') { 
    module.exports = class {
        constructor(salles,database_file) {
            this.salles = salles
            this.database = new sqlite3.Database(database_file, sqlite3.OPEN_READWRITE, (err) => {if (err !== null) console.error(err)} )
            
            console.log("update_db")
            actualize_salles(this.database ,this.salles )
            console.log("update_db_finished")

            cron.schedule('0 0 * * * *', async function() {
                console.log("update_db")
                actualize_salles(this.database ,this.salles )
            });

            this.salleEvents = salleEvents
            this.salleLibres = salleLibres
            this.convert_unix_to_local = convert_unix_to_local
        }
    }
}
