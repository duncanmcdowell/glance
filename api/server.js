var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var axios      = require('axios');
var moment     = require('moment');
var cors       = require('cors')
var WebSocket  = require('ws');
const http     = require('http');
mongoose.connect('mongodb://glance:NHM-r6U-t5m-nby@ds159856.mlab.com:59856/glance');
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

var port = process.env.PORT || 8080;
var router = express.Router();

// Schema

var Schema = mongoose.Schema;
var historicalPricePointSchema = new Schema({
  price: Number,
  date: Number,
  formattedDate: String,
  newsItem: Schema.Types.Mixed
});

var currentPriceSchema = new Schema({
  price: Number,
  date: String
})

let CurrentPrice = mongoose.model('CurrentPrice', currentPriceSchema);


// Sockets

const wss = new WebSocket.Server({ port: 9090 });

wss.on('connection', function connection(ws) {

  Api.getLatestPrice().then(function(price) {
    ws.send(JSON.stringify({currentPrice: price}));
  });
  setInterval(function() {
    Api.getLatestPrice().then(function(price) {
      ws.send(JSON.stringify({currentPrice: price}));
    });
  },7000)

  // getGasDetails().then(function(result) {
  //   // if (result.price != lastGasPrice) {
  //     ws.send(JSON.stringify({gasDetails: result}));
  //   // }
  // });
  //
  // getUncomfirmedTransactions().then(function(result) {
  //   ws.send(JSON.stringify({uncomfirmedTransactions: result}));
  // });
  //
  // getLastBlock().then(function(result) {
  //   ws.send(JSON.stringify({latestBlock: result}));
  // })

});

// First-party API functions

class Api {
  static async getLatestPrice() {
    try {
      let query = await CurrentPrice.findOne().sort({ field: 'asc', _id: -1 }).limit(1).select('price').exec();
      return query.price;
    }
    catch(err) {
      console.log(err);
    }
  }
}


// Third-party API functions

let parityEndpoint = "https://wallet.parity.io:8545"

getHistoricalPrice = function() {
  return axios.get('https://poloniex.com/public', {
    params: {
      command:'returnChartData',
      currencyPair: 'USDT_ETH',
      start: 1511281600,
      end: 9999999999,
      period: 14400
    }
  })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return error
    });
}

getNewsItems = function() {
  return axios.get('http://webhose.io/filterWebContent?token=8b783afd-c348-436d-8913-1e1450d86f00&format=json&ts=1511830330016&sort=crawled&q=ethereum%20social.facebook.shares%3A%3E5000')
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return {'error':error};
    });
}

getCurrentEthPrice = function() {
  return axios.get('https://poloniex.com/public', {
    params: {
      command:'returnTicker'
    }
  })
    .then(function (response) {
      if (response.data) {
        return parseFloat(response.data['USDT_ETH'].last,10).toFixed(2);
      }
    })
    .catch(function (error) {
      // likely a timeout
    });
}

setInterval(function() {
  getCurrentEthPrice().then(function(result) {
    CurrentPrice.create({price: result, date: new Date()}, function(err, pricePoints) {
      if (err) {
        console.log('failure saving current price data: ', err);
      }
    });
  });
}, 7000);

// TODO implement try/catch for these async awaits
getGasDetails = async function() {
  let response = await axios.post(parityEndpoint, {"method":"eth_gasPrice","params":[],"id":1,"jsonrpc":"2.0"})
  let result = await response;
  if (result.data) {
    parsedHex = parseInt(result.data.result, 16);
    let gwei = parsedHex / 1000000000 // convert from wei
    lastGasPrice = gwei; // this is ephemeral, could be moved to DB if necessary
    let health = determineHealth(gwei, 28, 60);
    return {price: gwei, health: health};
  }
}

getLastBlock = async function () {
  let response = await axios.post(parityEndpoint, {"method":"eth_getBlockByNumber","params":['latest', false],"id":1,"jsonrpc":"2.0"})
  let result = await response;
  if (result.data) {
    parsedHex = parseInt(result.data.result.number, 16);
    return parsedHex;
  }
}

getUncomfirmedTransactions = async function () {
  let response = await axios.get('https://api.blockcypher.com/v1/eth/main')
  let result = await response;
  if (result.data) {
    let health = determineHealth(result.data.unconfirmed_count, 100000, 180000);
    return {value: result.data.unconfirmed_count, health: health};
  }
}

// Helper functions and variables

let lastGasPrice = 0;

const determineHealth = function(value, low, middle) {
  if (value < low) {
    return {'status':'healthy', 'value':'#73d13d'};
  } else if (value > low && value < middle) {
    return {'status':'moderately healthy', 'value':'#fff566'};
  } else {
    return {'status':'unhealthy', 'value':'#ff4d4f'};
  }
}

saveHistoricalData = function() {
  getHistoricalPrice().then(function(result) {
    let parsedChartData = [];
    result.forEach(function(day) {
      var formattedDate = moment.unix(day.date).format('MMMM D');
      parsedChartData.push({
                            'date':day.date,
                            'formattedDate':formattedDate,
                            'price':day.open
                          })
    });
    getNewsItems().then(function (result) {
      if (result && result.posts.length) {
        // map out the posts that are on the same day
        result.posts.forEach(function(post) {
          // find the first date that matches
          let itemIndex = parsedChartData.findIndex(function(datapoint) {
            if (moment(datapoint.formattedDate).isSame(moment(post.published).format('MMMM D'))) {
              return datapoint;
            }
          });
          if (itemIndex != -1) {
            console.log('found', moment(post.published).format('MMMM D'))
            parsedChartData[itemIndex]['newsItem'] = post;
          }
        })
      }
      // Save to db
      try {
        var HistoricalPricePoint = mongoose.model('HistoricalPricePoint', historicalPricePointSchema);
        HistoricalPricePoint.create(parsedChartData, function(err, pricePoints) {
          if (err) {
            console.log('parsedChartData incorrectly formatted');
          }
          console.log('price points successfully created');
        });
      } catch (e) {
        console.log(e);
         print (e);
      }
    });
  })

}

//Router

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

router.route('/historical')
  .get(function (req, res) {
    var HistoricalPricePoint = mongoose.model('HistoricalPricePoint', historicalPricePointSchema);
    HistoricalPricePoint.find({},null, {sort: 'date'}, function(err, pricePoints) {
      res.send(pricePoints);
    });
  });

app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);
