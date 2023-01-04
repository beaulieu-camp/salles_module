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

  let esir = new esir_salles.default(salles, `${__dirname}/database.sqlite`)

  await esir.load

  esir.salleLibres(Object.keys(salles) , (results) => { 
    console.log( results ) 
  }, Date.now())

  esir.salleEvents(Object.keys(salles) , (results) => { 
    console.log( results["test1"][0] ) 
  }, Date.now())

  // await fetch("http://localhost:5000/close")
})()
