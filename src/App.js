import React, { Component } from 'react';
import Header from './components/Header';
import PriceChart from './components/PriceChart';
import KeyStats from './components/KeyStats';
import Details from './components/Details';
import update from 'immutability-helper';
import {Row, Col} from 'antd';
import './App.less';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPrice: '',
      keyStats: {
        latestBlock: '',
        gasDetails: {
          price: '',
          health: {
            status: '',
            value: ''
          }
        },
        uncomfirmedTransactions: {
          value: '',
          health: {
            status: '',
            value: ''
          }
        }
      },
    };
  }

  componentDidMount() {
    let vm = this;
    let ws = new WebSocket('ws://localhost:9090');
    ws.onmessage = function (event) {
      let data = JSON.parse(event.data)
      if (data.currentPrice) {
        let currentPrice = data.currentPrice;
        vm.setState({currentPrice});
      }
      if (data.gasDetails) {
        let gasDetails = data.gasDetails;
        let currentState = update(vm.state.keyStats, {gasDetails:
                                                       {
                                                         price: {$set: gasDetails.price},
                                                         health: {$set: gasDetails.health}
                                                       }
                                                     });
        vm.setState({keyStats: currentState})
      }
      if (data.uncomfirmedTransactions) {
        let uncomfirmedTransactions = data.uncomfirmedTransactions;
        let currentState = update(vm.state.keyStats, {uncomfirmedTransactions:
                                                       {
                                                         value: {$set: uncomfirmedTransactions.value},
                                                         health: {$set: uncomfirmedTransactions.health}
                                                       }
                                                     });
        vm.setState({keyStats: currentState})
      }
      if (data.latestBlock) {
        let latestBlock = data.latestBlock;
        let currentState = update(vm.state.keyStats, {latestBlock: {$set: latestBlock}});
        vm.setState({keyStats: currentState});
      }
    };
  }

  render() {
    return (
      <div className="App">
        <Row>
          <Col span={24} lg={{span:18, offset:3}}>
            <Header/>
          </Col>
          <Col span={24}>
            <PriceChart currentPrice={this.state.currentPrice} />
            <KeyStats {...this.state.keyStats}  />
          </Col>
          <Col span={24} md={{span:18, offset:3}}>
            <Details />
          </Col>
        </Row>
      </div>
    );
  }
}

export default App;
