var express = require('express');
const vm = require('./server/vinmonopolet.js')
const api = require('./server/api.js')
var bodyParser = require("body-parser");
const logger = require("./server/logger.js")
const path = require('path');
const jwt = require('jsonwebtoken');
var cors = require('cors')
const config = require('./config.js');
const qs = require('qs');
const request = require('request-promise-native');
const session = require('express-session');


var app = express();

app.use(session({
  secret: 'yQJKOPpYXj',
  resave: false,
  saveUninitialized: false,
  cookie: {}
}))

const untappdHost = 'https://untappd.com';
const untappdApiHost = 'https://api.untappd.com';
const untappdRedirectURL = config.baseURL + '/callback';


// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')))

app.use(cors())


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/api/getFromStore/:storeName/:searchFilters', function(req, res) {
  var searchFilters = JSON.parse(req.params.searchFilters)
  vm.fetchFromStore(req.params.storeName, searchFilters).then((result) => {
    res.send(result);
  }).catch((err) => {
    logger.log("getFromStore route encountered an error: " + err)
  })

});

app.get('/api/getStores', function(req, res) {
  vm.fetchStores().then((result) => {
    res.send(result);
  }).catch((err) => {
    console.log(err)
    logger.log("getStores route encountered an error: " + err)
  });
});

app.get('/login', (req, res) => {
  const options = {
    uri: untappdHost + '/oauth/authenticate/',
    qs: {
      client_id: config.untappdClientId,
      response_type: 'code',
      redirect_url: untappdRedirectURL,
      state: config.untappdClientState,
    },
  };
  const queryString = qs.stringify(options.qs);
  const uri = options.uri + '?' + queryString;
  res.redirect(uri);
});

app.get('/callback', (req, res) => {
  const { code } = req.query;
  const options = {
    uri: untappdHost + '/oauth/authorize/',
    qs: {
      client_id: config.untappdClientId,
      client_secret: config.untappdClientSecret,
      response_type: 'code',
      redirect_url: untappdRedirectURL,
      code: code,
    },
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true, // Automatically parses the JSON string in the response
    resolveWithFullResponse: true
  };

  request(options).then((response) => {
    if (response.statusCode == 200) {
      req.session.untappdToken = response.body.response.access_token;
      res.redirect('/');
    } else {
      reject("Error authenticating with Untappd, statusCode " + response.statusCode + ", response " + response.body)
    }
  }).catch(function (err) {
    reject(err.message);
  });
});

app.get('/api/user', (req, res) => {
  if (req.session.untappdToken) {
    const options = {
      uri: untappdApiHost + '/v4/user/info/',
      qs: {
        access_token: req.session.untappdToken,
        compact: true,
      },
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true, // Automatically parses the JSON string in the response
      resolveWithFullResponse: true
    };

    request(options).then((response) => {
      const remaining = response.headers['x-ratelimit-remaining'];
      if (response.statusCode == 200 && remaining >=1) {
        res.status(200).json(response.body.response)
      } else {
        if (response.headers['status'] == 429) {
          reject("Untappd API limit reached for this hour");
        } else {
          reject("Untappd API encountered an error, statusCode " + response.statusCode + ", response " + response.body)
        }
      }
    }).catch(function (err) {
      reject(err.message);
    });
  }
  else {
    return res.status(403).json({"error": "You need to login to Untappd for this"});
  }
});


// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'))
})


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Mixing it up on port ${PORT}`)
})
// module.exports = app;
