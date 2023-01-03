const https = require('https');
const fs = require('fs');
const esir = require('./module.js')

const options = {
  	key: fs.readFileSync('/root/.getssl/aquabx.ovh/aquabx.ovh.key'),
  	cert: fs.readFileSync('/root/.getssl/aquabx.ovh/aquabx.ovh.crt')
};


function write(){
	fs.writeFile('nouveauFichier.txt', 'Mon contenu', function (err) {
   		if (err) throw err;
   		console.log('Fichier créé !');
	});
}

https.createServer(options, async function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*')


	try {

	let all_salles = await fetch("https://github.com/AquaBx/salles_esir/raw/main/salles/data.json")
	all_salles = await all_salles.json()

	let query = new URLSearchParams( req.url.split("/").pop() );

	let date = Date.now()
    	if (query.get("date")){
        	date = parseInt( query.get("date") )
    	}

    		let salles = query.get("salles").split(",")
    		let resp = {}

    		if (query.get("type") == "events"){
        		for (let salle of salles){
            		let key = all_salles[salle]          
            		let result = await esir.salleEvents(key,date);
            		resp[salle] = result
        		}
    		}
    		else if (query.get("type") == "libres"){
        		for (let salle of salles){
            		let key = all_salles[salle]            
            		let result = await esir.salleLibres(key,date);
            		resp[salle] = result
        		}
    		}
    		else{}  

		res.writeHead(200);
  		res.end(JSON.stringify(resp) + "\n");
  	} 
  	catch (error) {
    	res.writeHead(500);
  		res.end(error + "\n");
  	}
	
  	

}).listen(2003);