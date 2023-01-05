const cron = require("node-cron");
const sqlite3 = require('sqlite3').verbose();

type Event = {
    "start"?:number,
    "end"?:number,
    "description"?:string,
    "summary"?:string,
    "uid"?:string,
}

type Object_of_Events = {
    [key:string]:Event
}

function to_date(char:string){
    var year   = parseInt( char.slice( 0, 4) )
    var month  = parseInt( char.slice( 4, 6) )
    var day    = parseInt( char.slice( 6, 8) )
    var hour   = parseInt( char.slice( 9,11) )
    var minute = parseInt( char.slice(11,13) )
    var sec    = parseInt( char.slice(13,15) )
    var date    = new Date(Date.UTC(year,month-1,day,hour,minute,sec))
    return date.getTime()
}

function checkafter(liste:Event[],i=0){
    let b = i+1
    while ( liste[b] !== undefined && liste[i]["end"] === liste[b]["start"] ) {
        i += 1
        b = i+1
    }
    return i
}

function parse(data:string) {
    let data_split = data.replaceAll("\r\n ","").split("\r\n");
    let obj =  [];
    let nlist:Event = {}
    for (let cle in data_split) {

        let valeur = data_split[cle]
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

function sql_reset(salle:string){
    return `CREATE TABLE IF NOT EXISTS ${salle}
    (
        uid VARCHAR(60),
        salle VARCHAR(30),
        start INT,
        end INT,
        summary VARCHAR(100),
        description VARCHAR(255)
    )`
}

function actualize_salles(db,salles:Object_of_Events) {
    /*
    fonction qui permet d'actualiser toutes les tables représentant les salles
    */
    return Object.keys(salles).map((key:String) => new Promise(async (resolve, reject)=>{
        let salle = salles[key]
        let name = salle.name ? salle.name : key

        let url = salle.link
        let req = await fetch(url)

        if (req.status !== 200) { return reject(`http error : ${req.status} ${req.statusText}`) }
        let text = await req.text()
        let cal = await parse( text )

        let sql_values:any = []
        for (let event of cal) {
            sql_values = sql_values.concat( Object.values(event) )
        }

        let sql1 = sql_reset(name)

        let sql2 = `DELETE FROM ${name}`

        let placeholders = cal.map((e) => '(?,?,?,?,?)').join(',');
        let sql3 = `INSERT INTO ${name} (start, end, summary, description, uid) VALUES ${placeholders}`

        db.serialize(() => {
            db.run( sql1, function(err:Error) {
                if (err) reject(`database error : ${err.message}`)
            })
            db.run( sql2, function(err:Error) {
                    if (err) reject(`database error : ${err.message}`)
            })
            db.run( sql3, sql_values , function(err:Error) {
                if (err) Promise.reject(`database error : ${err.message}`)
                else resolve("updated")
            })
        })
    }))   
}

function salleLibres(salles: string[], callback : Function, date = Date.now(),results={}, db=this.database) {
    /*
        Retourne si la salle est libre (true) ou non (false) sur 

        date est par défaut Date.now()

        Args : 
            - salles : list of strings
            - date : int (UNIX time)
        Return :
            - return.state : booléen : état de la salle ( libre : true , occupé : false )
            - return.until : int : date de fin de l'état (UNIX time)
    */

    let salle = salles.pop()
    if (salle === undefined ) { return callback(results) }

    let sql = `SELECT * FROM ${salle} WHERE start>=${date} ORDER BY start ASC`

    read_db(db,sql, (data: Event[] ) => {
        if (data === undefined){ 
            results[salle] = {"state":"undefined"}
        }
        else if ( date < data[0]["start"] ) { 
            results[salle] = { state : true, until: data[0]["start"] }
        }
        else {
            let i = checkafter(data) 
            results[salle] = { state : false, until: data[i]["end"] }
        }

        salleLibres(salles,callback,date,results,db)
    })
}

function salleEvents(salles:string[],callback:Function,date=Date.now(),results={},db=this.database) {
    /*
        Retourne les horaires des cours/events d'une journée donnée dans une salle donnée
        
        Args:
            - salle : list of strings
            - date : int (UNIX time)
        return : 
            - liste des events d'une journée
    */
    let salle = salles.pop()
    if ( salle === undefined ) { return callback(results) }

    let min_date1 = (new Date(date)).setHours(0)
    let min_date2 = (new Date(min_date1)).setMinutes(0)
    let min_date3 = (new Date(min_date2)).setSeconds(0)
    let max_date = min_date3 + 24*60*60*1000
    
    let sql = `SELECT * FROM ${salle} WHERE (start>=${min_date3}) AND (end<=${max_date}) ORDER BY start ASC`

    read_db(db,sql, (data:Object_of_Events) => {
        results[salle] = data
        salleEvents(salles,callback,date,results,db)
    })
}

function convert_unix_to_local(unix:number,local="fr-FR"){
    var date = new Date(unix)
    return date.toLocaleDateString(local, {weekday: "long", day: "numeric", hour: "numeric", minute: "numeric"})
}

function close_db(db){
    db.close((err:Error) => {
        if (err) {
            console.error(err.message);
        }
    });
}

function read_db(db,sql_command:string,callback:Function) {
    db.all(sql_command, (err:Error, rows:[]) => {
        if (err) console.error(err.message, sql_command);
        else callback(rows)
    })
}


export default class {

    salles
    database
    loaded
    salleEvents
    salleLibres
    convert_unix_to_local

    constructor(salles,database_file:string) {
        this.salles = salles
        this.database = new sqlite3.Database(database_file, sqlite3.OPEN_READWRITE, (err:Error) => {if (err !== null) console.error(err)} )
        
        let parent = this
        cron.schedule('0 0 * * * *', async (time:Date) => {
            console.log(time, "database update")
            parent.loaded = actualize_salles(parent.database ,parent.salles )
        });
        
        this.loaded = actualize_salles( this.database, this.salles )
        this.salleEvents = salleEvents
        this.salleLibres = salleLibres
        this.convert_unix_to_local = convert_unix_to_local
    }
}