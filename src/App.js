import React, { Component } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PriceChart from './components/PriceChart';
import KeyStats from './components/KeyStats';
import Details from './components/Details';
import update from 'immutability-helper';
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
        <Header />
        <Hero />
        <PriceChart currentPrice={this.state.currentPrice} />
        <KeyStats {...this.state.keyStats}  />
        <Details />
      </div>
    );
  }
}

export default App;
