const https = require('http');
const esir_salles = require('../index.js')
const fs = require('fs');

let salles = {
    "b42_amphi_l": {
      "link": "https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/m32R1R3k.shu",
    },
    "b42_amphi_m": {
      "link": "https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/53yjqRYj.shu",
    },
    "b42_amphi_n": {
      "link": "https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/x3dQlAYe.shu",
    },
    "b41_salle_001": {
      "link": "https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/53waqXny.shu",
    },
    "b41_salle_002": {
      "link": "https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/o35z95YR.shu",
    },
    "b41_salle_003": {
      "link": "https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/KW7vMwnM.shu",
    },
    "b41_salle_004": {
      "link": "https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/L3ZDOvnJ.shu",
    },
    "b41_salle_101": {
      "link": "https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/E3eJ0rY5.shu",
    },
    "b41_salle_102": {
      "link": "https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/1346pZnk.shu",
    },
    "b41_salle_103": {
      "link": "https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/OnEKNN3r.shu",
    },
    "b41_salle_104": {
      "link": "https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/kYkblw3A.shu",
    }
}

let esir = new esir_salles(salles,"./tests/database.db")

const options = {
  	// key: fs.readFileSync('/root/.getssl/aquabx.ovh/aquabx.ovh.key'),
  	// cert: fs.readFileSync('/root/.getssl/aquabx.ovh/aquabx.ovh.crt')
};

https.createServer(options, async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    try{
        let all_salles = await fetch("https://github.com/AquaBx/salles_esir/raw/main/salles/data.json")
        all_salles = await all_salles.json()

        let query = new URLSearchParams( req.url.split("/").pop() );

        let date = query.get("date")==null ? Date.now() : query.get("date")
        let salles = query.get("salles").split(",")
        
        if (query.get("type") == "events"){
            esir.salleEvents(salles, (results) => {
                    res.writeHead(200)
                    res.end(JSON.stringify(results))
            }, date
            )
        }
        else if (query.get("type") == "libres"){
            esir.salleLibres(salles, (results) => {
                res.writeHead(200)
                res.end(JSON.stringify(results))
            }, date
            )
        }
        else{}  

    } 
    catch (error) {
        res.writeHead(500);
        res.end(error + "\n");
    }
}).listen(2003);
