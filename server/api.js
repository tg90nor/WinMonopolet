//Imports
var config = require("./config.js")
var request = require('request');
const https = require('https');

const clientID = config.unt_clientId;
const clientSecret = config.unt_clientSecret;

// var url = 'https://api.untappd.com/v4/search/beer?client_id='+config.unt_clientId+'&client_secret='+config.unt_clientSecret+'&q=Mack Mikrobryggeri Error 404 Dubbel/Saison'
//
// request(url, function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//     var res = JSON.parse(body)
//     var count =  res.response.beers.count
//     var remaining = parseInt(response.headers['x-ratelimit-remaining'])
//     // console.log(res.response.beers.items[0].beer.bid)
//     console.log(count)
//   } else {
//     console.log(response.statusCode)
//   }
// });

module.exports = {

/*
Tries to get the BID (beer ID) that untappd uses for the given beer.
Since the naming convetion between vinmonopolet and Untappd is different, it is no guaranteed to find it.
*/
  getBID : function(name){
    var url = 'https://api.untappd.com/v4/search/beer?client_id='+clientID+'&client_secret='+clientSecret+'&q='+name

    request(url, function (error, response, body) {
      var res = JSON.parse(body)
      var count =  res.response.beers.count
      var remaining = parseInt(response.headers['x-ratelimit-remaining'])
      if (!error && response.statusCode == 200 && remaining >1 ) {
        if(count == 0){
          return null
        }
        console.log(res.response.beers.items[0].beer.bid)
        var bid = res.response.beers.items[0].beer.bid
        return bid
      } else {
        console.log(response.statusCode)
        return false
      }
    });
  }

}
