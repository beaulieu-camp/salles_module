const esir_salles = require('..')
var fs = require('fs');
var express = require("express");
const { ListFormat } = require('typescript');
let app = express();

let data = fs.readFileSync(`${__dirname}/planning.ics`).toString()

app.get("/data", function(req, res) {
  res.send(data);
});

app.get("/close", function(req, res) {
  res.send("ok");
  server.close()
  process.exit()
});

let server = app.listen(5000);

(async function() {
  let salles = {
    "test1": {
      "link": "http://localhost:5000/data",
    },
    "test2": {
      "link": "http://localhost:5000/data",
    }
  }

  let esir = new esir_salles.default(salles, `${__dirname}/database.sqlite`);
  Promise.all( esir.loaded ).then((val)=>{
    console.log(val)
    
    esir.salleLibres(Object.keys(salles) , (results) => { 
      console.log( results["test1"]["state"] === false ) 
      console.log( results["test1"]["until"] === 1673450100000 ) 
      console.log( results["debug"]["test1"][0] ) 
      console.log( results["debug"]["test1"][1] ) 
      console.log( results["date"] ) 
    }, 1673447400000)

    esir.salleEvents(Object.keys(salles) , (results) => { 
      console.log( results["test1"][0]["uid"] === "ADE60456d706c6f6973647574656d7073323032322d323032332d383536352d312d30" ) 
      console.log( results["test1"][1]["uid"] === "ADE60456d706c6f6973647574656d7073323032322d323032332d35373335312d302d30" ) 
      console.log( results["test1"][2]["uid"] === "ADE60456d706c6f6973647574656d7073323032322d323032332d38363232302d302d30" ) 
    }, 1673447400000)

    // fetch("http://localhost:5000/close")
  })
})()
