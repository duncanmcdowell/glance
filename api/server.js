var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var axios      = require('axios');
var moment     = require('moment');
var cors       = require('cors')
var WebSocket  = require('ws');
mongoose.connect('mongodb://glance:NHM-r6U-t5m-nby@ds159856.mlab.com:59856/glance');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

var port = process.env.PORT || 8080;
var router = express.Router();



var Schema = mongoose.Schema;
var historicalPricePointSchema = new Schema({
  price: Number,
  date: Number,
  formattedDate: String
});

const getHistoricalPrice = function() {
  axios.get('https://poloniex.com/public', {
    params: {
      command:'returnChartData',
      currencyPair: 'USDT_ETH',
      start: 1511281600,
      end: 9999999999,
      period: 14400
    }
  })
    .then(function (response) {
      if (response.data) {
        let parsedChartData = [];
        response.data.forEach(function(day) {
          var formattedDate = moment.unix(day.date).format('MMMM D');
          parsedChartData.push({
                                'date':day.date,
                                'formattedDate':formattedDate,
                                'price':day.open
                              })
        });
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
      }
    })
    .catch(function (error) {
      console.log(error);
      return error
    });
}

// getHistoricalPrice();


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

// static getCurrentEthPrice() {
//   return axios.get('https://poloniex.com/public', {
//     params: {
//       command:'returnTicker'
//     }
//   })
//     .then(function (response) {
//       return response.data;
//     })
//     .catch(function (error) {
//       return error
//     });
// }

app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);
