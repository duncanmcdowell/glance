let express    = require('express');
let app        = express();
let bodyParser = require('body-parser');
let mongoose   = require('mongoose');
let axios      = require('axios');
let moment     = require('moment');
let cors       = require('cors')
let WebSocket  = require('ws');
let http       = require('http');
let dbCreds    = require('./db-creds')
let connectionOptions = { keepAlive: 1, connectTimeoutMS: 30000, reconnectTries: 30, reconnectInterval: 5000, useMongoClient: true }
mongoose.connect('mongodb://glance:'+ dbCreds.password +'@ds159856.mlab.com:59856/glance', connectionOptions);
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

let port = process.env.PORT || 8080;
let router = express.Router();

// Schema

let Schema = mongoose.Schema;
let historicalPricePointSchema = new Schema({
  price: Number,
  date: Number,
  formattedDate: String,
  newsItem: Schema.Types.Mixed
});

let currentPriceSchema = new Schema({
  price: Number,
  date: String
})

let lastBlockSchema = new Schema({
  value: Number,
  date: String
})

let uncomfirmedTransactionsSchema = new Schema({
  value: Number,
  health: Schema.Types.Mixed,
  date: String
})

let gasPriceSchema = new Schema({
  price: Number,
  health: Schema.Types.Mixed,
  date: String
})

let CurrentPrice = mongoose.model('CurrentPrice', currentPriceSchema);
let LastBlock = mongoose.model('LastBlock', lastBlockSchema);
let UncomfirmedTransactions = mongoose.model('UncomfirmedTransactions', uncomfirmedTransactionsSchema);
let GasPrice = mongoose.model('GasPrice', gasPriceSchema);

// Sockets and polling functions

const wss = new WebSocket.Server({ port: 9090 });

wss.on('connection', function connection(ws) {

  websocketHelper(ws);
  // update client every five seconds
  setInterval(function() {
    websocketHelper(ws);
  },5000)

});

// Update DB every ten seconds

setInterval(function() {
  ExtApi.getCurrentEthPrice().then(function(result) {
    CurrentPrice.create({price: result, date: new Date()}, function(err, price) {
      if (err) {
        console.log('failure saving current price data: ', err);
      }
    });
  });

  ExtApi.getLastBlock().then(function(result) {
    LastBlock.create({value: result, date: new Date()}, function(err, block) {
      if (err) {
        console.log('failure saving last block data: ', err);
      }
    });
  });

  ExtApi.getGasDetails().then(function(result) {
    GasPrice.create({price: result.price, health: result.health, date: new Date()}, function(err, block) {
      if (err) {
        console.log('failure saving gas price data: ', err);
      }
    });
  });
}, 10000);

// Update DB every 25 seconds

setInterval(function() {
  ExtApi.getUncomfirmedTransactions().then(function(result) {
    UncomfirmedTransactions.create({value: result.value, health: result.health, date: new Date()}, function(err, block) {
      if (err) {
        console.log('failure saving gas price data: ', err);
      }
    });
  });
},25000)

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
  static async getLastBlock() {
    try {
      let query = await LastBlock.findOne().sort({ field: 'asc', _id: -1 }).limit(1).select('value').exec();
      return query.value;
    }
    catch(err) {
      console.log(err);
    }
  }
  static async getGasPrice() {
    try {
      let query = await GasPrice.findOne().sort({ field: 'asc', _id: -1 }).limit(1).select('price health').exec();
      return query;
    }
    catch(err) {
      console.log(err);
    }
  }
  static async getUncomfirmedTransactions() {
    try {
      let query = await UncomfirmedTransactions.findOne().sort({ field: 'asc', _id: -1 }).limit(1).select('value health').exec();
      return query;
    }
    catch(err) {
      console.log(err);
    }
  }
}

// Third-party API functions

class ExtApi {

  static getHistoricalPrice() {
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

  static async getNewsItems() {
    try {
      let response = await axios.get('http://webhose.io/filterWebContent?token=8b783afd-c348-436d-8913-1e1450d86f00&format=json&ts=1511830330016&sort=crawled&q=ethereum%20social.facebook.shares%3A%3E5000')
      let result = await response;
      return result.data;
    }
    catch (err) {
      console.log('error is: ', err.code);
    }
  }

  static async getCurrentEthPrice() {
    try {
      let response = await axios.get('https://poloniex.com/public', {params: {command:'returnTicker'}})
      let result = await response;
      return parseFloat(result.data['USDT_ETH'].last,10).toFixed(2);
    }
    catch (err) {
      console.log('error is: ', err.code);
    }
  }

  static async getGasDetails() {
    try {
      let response = await axios.post(parityEndpoint, {"method":"eth_gasPrice","params":[],"id":1,"jsonrpc":"2.0"})
      let result = await response;
      let parsedHex = parseInt(result.data.result, 16);
      let gwei = parsedHex / 1000000000 // convert from wei
      let lastGasPrice = gwei; // this is ephemeral, could be moved to DB if necessary
      let health = determineHealth(gwei, 28, 60);
      return {price: gwei, health: health};
    }
    catch (err) {
      console.log('error is: ', err.code);
    }
  }

  static async getLastBlock() {
    try {
      let response = await axios.post(parityEndpoint, {"method":"eth_getBlockByNumber","params":['latest', false],"id":1,"jsonrpc":"2.0"})
      let result = await response;
      let parsedHex = parseInt(result.data.result.number, 16);
      return parsedHex;
    }
    catch (err) {
      console.log('error is: ', err.code);
    }
  }

  static async getUncomfirmedTransactions() {
    try {
      let response = await axios.get('https://api.blockcypher.com/v1/eth/main')
      let result = await response;
      let health = determineHealth(result.data.unconfirmed_count, 100000, 180000);
      return {value: result.data.unconfirmed_count, health: health};
    }
    catch(err) {
      console.log('error is: ', err.code);
    }
  }
}

// Helper functions and variables

let lastGasPrice = 0;
let parityEndpoint = "https://wallet.parity.io:8545"

let determineHealth = function(value, low, middle) {
  if (value < low) {
    return {'status':'healthy', 'value':'#73d13d'};
  } else if (value > low && value < middle) {
    return {'status':'moderately healthy', 'value':'#fff566'};
  } else {
    return {'status':'unhealthy', 'value':'#ff4d4f'};
  }
}

let websocketHelper = function(ws) {
  Api.getLatestPrice().then(function(price) {
    ws.send(JSON.stringify({currentPrice: price}), function(err) {
      // console.log(err);
    });
  });
  Api.getLastBlock().then(function(block) {
    ws.send(JSON.stringify({latestBlock: block}), function(err) {
      // console.log(err);
    });
  });
  Api.getGasPrice().then(function(gasDetails) {
    ws.send(JSON.stringify({gasDetails: gasDetails}), function(err) {
      // console.log(err);
    });
  });
  Api.getUncomfirmedTransactions().then(function(uncomfirmedTransactions) {
    ws.send(JSON.stringify({uncomfirmedTransactions: uncomfirmedTransactions}), function(err) {
      // console.log(err);
    });
  });
}

saveHistoricalData = function() {
  ExtApi.getHistoricalPrice().then(function(result) {
    let parsedChartData = [];
    result.forEach(function(day) {
      var formattedDate = moment.unix(day.date).format('MMMM D');
      parsedChartData.push({
                            'date':day.date,
                            'formattedDate':formattedDate,
                            'price':day.open
                          })
    });
    ExtApi.getNewsItems().then(function (result) {
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
console.log('listening on port ' + port);
