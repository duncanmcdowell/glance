import React, { Component } from 'react';
import '../App.less';
import Api from '../Api';
import {Row, Col} from 'antd';
import {Chart, Line} from 'react-chartjs-2';

let parsedChartData = [];
let indicies = [];

class PriceChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartParameters: {}
    };
  }

  formatTooltip(tooltip, chart) {
    if (parsedChartData[tooltip[0].index] && parsedChartData[tooltip[0].index].newsItem) {
      return parsedChartData[tooltip[0].index].newsItem.title
    }
  }

  componentWillMount() {
  	Chart.pluginService.register({
  		afterDatasetDraw: function (chart) {
        // This is a custom plugin that connects to the afterDatasetDraw method exposed by chartJS.
        // The key functionality in this plugin is to differentiate the datapoints on the line chart
        // which have news items associated with them (captured by the indicies array)
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
      console.log(result);
      parsedChartData = result;
      // build annotation layer
      indicies = parsedChartData.map(function(dataPoint, index) {
        return dataPoint.newsItem ? index : undefined;
      }).filter(function(x) {
        return typeof x !== 'undefined';
      });

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
      if (parsedChartData) {
        return (
          <div className="PriceChart">
            <Row>
              <Col className="current-price" span={16} offset={4}>
                <div className='hero'>
                  <h2><span>Glance</span> displays real-time statistics from the Ethereum blockchain driven by multiple APIs.</h2>
                </div>
                <div>
                  <h1><span className="animated fade-in">{this.props.currentPrice}</span> <span> ETH/USD </span></h1>
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
                      if (arr[0] && arr[0]['_index']) {
                        let index = arr[0]['_index'];
                        if (parsedChartData[index] && parsedChartData[index].newsItem) {
                          window.open(parsedChartData[index].newsItem.url, '_blank');
                        }
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
