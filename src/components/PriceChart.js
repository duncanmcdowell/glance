import React, { Component } from 'react';
import '../App.less';
import Api from '../Api';
import {Row, Col, Input} from 'antd';
import {keccak256 as sha3} from 'js-sha3';
import {Chart, Line} from 'react-chartjs-2';
import moment from 'moment';

let parsedChartData = [];
let ethPriceInterval = null;
let indicies = [];

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
  }

  formatTooltip(tooltip, chart) {
    if (parsedChartData[tooltip[0].index] && parsedChartData[tooltip[0].index].newsItem) {
      return parsedChartData[tooltip[0].index].newsItem.title
    }
  }

  componentWillMount() {
    var vm = this;
  	Chart.pluginService.register({
  		afterDatasetDraw: function (chart) {
        // https://github.com/chartjs/Chart.js/issues/3245
          if (indicies.length) {
            indicies.forEach(function(index) {
              let point = chart.getDatasetMeta(0).data[index];
              point.custom = point.custom || {};
              point.custom.radius = 12;
              // console.log(point);
              // point.custom.hoverRadius = 20;
              // point.custom.hitRadius = 30;
              // point.custom.hitRadius = 30  ;
            });
          }
        }
  	});
  }

  componentDidMount() {
    var vm = this;

    // Chart Data
    Api.getHistoricalEthPrice().then(function(result){
      parsedChartData = result;
      // build annotation layer
      indicies = parsedChartData.map(function(dataPoint, index) {
        if (dataPoint.newsItem) {
          return index;
        }
      }).filter(function(x) {
        return typeof x !== 'undefined';
      });

      vm.setState({parsedChartData: parsedChartData});
      vm.setState({chartParameters: {
        labels: parsedChartData.map(function(datapoint) {
          return datapoint.formattedDate;
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
              return datapoint.price.toFixed(2);
            }),
          }
        ]
      }});
    });
  }
  render() {
      //<Input placeholder="Basic usage" value={this.state.input} onChange={this.handleChange} />
      if (this.state.parsedChartData) {
        return (
          <div className="PriceChart">
            <Row>
              <Col className="current-price" span={16} offset={4}>
                <div>
                  <h1><span className={this.state.refreshCurrentPrice ? '' : 'animated fadeIn'}>{this.props.testProp}</span> <span> ETH/USD </span></h1>
                  <p>price updates every five seconds.</p>
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
                      let index = arr[0]['_index'];
                      if (parsedChartData[index] && parsedChartData[index].newsItem) {
                        window.open(parsedChartData[index].newsItem.url, '_blank');
                      }
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
