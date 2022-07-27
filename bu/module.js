const axios = require('axios');
const jsdom = require("jsdom");

async function request(url){
  const resp = await axios.get(url);
  return resp.data;
};

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var hh = this.getHours()
  var dd = (hh>20 ? 1 : 0) + this.getDate();        
  return [this.getFullYear(), (mm>9 ? '' : '0') + mm, (dd>9 ? '' : '0') + dd].join('-');
};

async function parse(url){
    var req = await request(url)

    const dom = new jsdom.JSDOM(req);
    const document = dom.window.document
    var lis2 = document.querySelectorAll("tr")
    console.log(lis2)
    var liste2 = []
    for (var tr of lis2) {
        var nlist = []
        var th = tr.querySelectorAll("th")
      if (th.length == 0){
        th = tr.querySelectorAll("td")
      }

      for (var td of th){
            var txt = td.textContent
            txt = txt.split("\n").join("")
            txt = txt.split(" ").join("")     
            nlist.push(txt)
      }
      liste2.push(nlist)
    }
    liste2[0][0] = "Jours"
    return liste2
}

async function get_biblio(time=Date.now()){
    var date = new Date(time);
    var url = "https://univ-rennes1.libcal.com/widget/hours/grid?systemTime=1&date="+date.yyyymmdd()
    return await parse(url)
}

exports.get_biblio = get_biblio
