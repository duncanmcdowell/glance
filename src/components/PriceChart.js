import React, { Component } from 'react';
import '../App.less';
import Api from '../Api';
import {Row, Col, Input} from 'antd';
import {keccak256 as sha3} from 'js-sha3';
import {Chart, Line} from 'react-chartjs-2';
import moment from 'moment';

var parsedChartData = [];
var ethPriceInterval = null;

class PriceChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parsedChartData: [],
      chartParameters: {},
      currentPrice: '',
      refreshCurrentPrice: false,
      input: '',
      ethBalance: ''
    };
    this.handleChange = this.handleChange.bind(this);
  }

  isAddress = function (address) {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        // If it's all small caps or all all caps, return true
        return true;
    } else {
        // Otherwise check each case
        return this.isChecksumAddress(address);
    }
  };

  isChecksumAddress = function (address) {
    // Check each case
    address = address.replace('0x','');
    var addressHash = sha3(address.toLowerCase());
    for (var i = 0; i < 40; i++ ) {
        // the nth letter should be uppercase if the nth digit of casemap is 1
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
            return false;
        }
    }
    return true;
  };

  handleChange(event) {
    var vm = this;
    if (this.isAddress(event.target.value)) {
      let address = event.target.value;
      let tempData = this.state.parsedChartData.map(function(datapoint) {
        return datapoint.value.toFixed(2) * 2
      })
      Api.getBalance(address).then(function(result) {
        let balance = result / 10e17;
        let currentPrice = vm.state.currentPrice * balance;
        clearInterval(ethPriceInterval);
        vm.setState({balance, currentPrice});
      })
      this.setState({parsedChartData: tempData});
    }
    this.setState({input: event.target.value});
  }

  formatTooltip(tooltip, chart) {
    if (parsedChartData[tooltip[0].index] && parsedChartData[tooltip[0].index].newsItem) {
      return parsedChartData[tooltip[0].index].newsItem.title
    }
  }

  componentWillMount() {
  	Chart.pluginService.register({
  		afterDraw: function (chart, easing) {
        // data.datasets[datasetIndex]
        // https://github.com/chartjs/Chart.js/issues/3245
        if (chart.data.datasets && chart.data.datasets[0] && parsedChartData) {
          parsedChartData.forEach(function(datapoint, index) {
            if (datapoint.newsItem) {
              let point = chart.getDatasetMeta(0).data[index];
              point.custom = point.custom || {};
              point.custom.radius = 15;
            }
          })
        }
  		}
  	});
  }

  componentDidMount() {
    var vm = this;
    var getCurrentEthPrice = function(){
      vm.setState({refreshCurrentPrice : true});
      Api.getCurrentEthPrice().then(function(result){
        var currentPrice = parseInt(result['USDT_ETH'].last,10)
        if (currentPrice.toFixed(2) !== vm.state.currentPrice) {
          vm.setState({refreshCurrentPrice : false});
        }
        vm.setState({currentPrice: currentPrice.toFixed(2)});
      });
    }
    // Current Price data
    getCurrentEthPrice();
    ethPriceInterval = setInterval(getCurrentEthPrice, 5000);

    // Chart Data
    Api.getHistoricalEthPrice().then(function(result){
      result.forEach(function(day) {
        var then = moment.unix(day.date);
        parsedChartData.push({'date':then.format('MMMM D'), 'value':day.open})
      });
      vm.setState({parsedChartData: parsedChartData});
      vm.setState({chartParameters: {
        labels: parsedChartData.map(function(datapoint) {
          return datapoint.date;
        }),
        datasets: [
          {
            label: 'Ethereum Price',
            fill: true,
            lineTension: 0.1,
            backgroundColor: '#44a8d7',
            // borderColor: '#025fb7',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: '#025fb7',
            // pointBackgroundColor: '#fff',
            pointBackgroundColor: ['red', 'green', 'blue', 'yellow'],
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#44a8d7',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            legend: {
              'display': false
            },
            data: parsedChartData.map(function(datapoint) {
              return datapoint.value.toFixed(2);
            }),
          }
        ]
      }});
    });
    Api.getNewsItems().then(function (result) {
      if (result && result.posts.length) {
        // map out the posts that are on the same day
        result.posts.forEach(function(post) {
          // find the first date that matches
          let itemIndex = parsedChartData.findIndex(function(datapoint) {
            if (moment(datapoint.date).isSame(moment(post.published).format('MMMM D'))) {
              return datapoint;
            }
          });
          if (itemIndex != -1) {
            parsedChartData[itemIndex]['newsItem'] = post;
          }

        })
      }
      console.log(parsedChartData)
    });
  }
  render() {
      if (this.state.parsedChartData) {
        return (
          <div className="PriceChart">
            <Row>
              <Col className="current-price" span={16} offset={4}>
                <div>
                  <h1><span className={this.state.refreshCurrentPrice ? '' : 'animated fadeIn'}>{this.state.currentPrice}</span> <span> ETH/USD </span></h1>
                  <p>price updates every five seconds.</p>
                  <Input placeholder="Basic usage" value={this.state.input} onChange={this.handleChange} />
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Line
                  data={this.state.chartParameters}
                  options = {{
                    tooltips: {
                      callbacks: {
                        afterBody: this.formatTooltip
                      }
                    },
                    onClick: function(event, arr) {
                      console.log(arr);
                      // window.open('https://reddit.com/r/aww', '_blank');
                    },
                    legend:false,
                    scales: {
                      xAxes: [{
                        display: false,
                        gridLines: {
                          display:false
                        }
                      }],
                      yAxes: [{
                        display: false,
                        gridLines: {
                          display:false
                        }
                      }]
                    }
                  }}
                />
              </Col>
            </Row>
          </div>
        );
      }
  }
}

export default PriceChart;
