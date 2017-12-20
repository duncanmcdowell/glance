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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

var port = process.env.PORT || 8080;
var router = express.Router();

// Sockets

const wss = new WebSocket.Server({ port: 9090 });
console.log(wss);

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  setTimeout(function(){
    getCurrentEthPrice().then(function(result) {
      if (result) {
        console.log('sending new price...');
        ws.send(JSON.stringify({currentPrice: result}));
      }
    });
  },1000)

  // setInterval(function() {
  //   getCurrentEthPrice().then(function(result) {
  //     if (result) {
  //       console.log('sending new price...');
  //       ws.send(JSON.stringify({currentPrice: result}));
  //     }
  //   });
  // },3000);

});

// Third-party API functions

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
      return error
    });
}

// Schema

var Schema = mongoose.Schema;
var historicalPricePointSchema = new Schema({
  price: Number,
  date: Number,
  formattedDate: String,
  newsItem: Schema.Types.Mixed
});

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
