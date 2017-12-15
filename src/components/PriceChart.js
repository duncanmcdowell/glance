import React, { Component } from 'react';
import '../App.less';
import Api from '../Api';
import {Line} from 'react-chartjs-2';
import moment from 'moment';

var parsedChartData = [];
var data = {};

class PriceChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parsedChartData: [],
      chartParameters: {},
      currentPrice: ''
    };
  }
  componentDidMount() {
    var vm = this;
    var getCurrentEthPrice = function(){
      Api.getCurrentEthPrice().then(function(result){
        var currentPrice = parseInt(result['USDT_ETH'].last,10)
        console.log(currentPrice);
        vm.setState({currentPrice: currentPrice.toFixed(2)});
      });
    }
    // Current Price data
    getCurrentEthPrice();
    const ethPriceInterval = setInterval(getCurrentEthPrice, 5000);

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
            borderColor: '#025fb7',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: '#025fb7',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(75,192,192,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            legend: {
              'display': false
            },
            data: parsedChartData.map(function(datapoint) {
              return datapoint.value;
            }),
          }
        ]
      }});
    });
  }
  render() {
      if (this.state.parsedChartData) {
        return (
          <div className="PriceChart">
            <h1>{this.state.currentPrice}</h1>
            <Line
              data={this.state.chartParameters}
              options = {{
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
          </div>
        );
      }
  }
}

export default PriceChart;
