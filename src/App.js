import React, { Component } from 'react';
import Api from './Api';
import Header from './components/Header';
import Hero from './components/Hero';
import PriceChart from './components/PriceChart';
import KeyStats from './components/KeyStats';
import Details from './components/Details';
import './App.less';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPrice: ''
    };
  }

  componentDidMount() {
    let currentPrice = 0;
    let vm = this;
    let ws = new WebSocket('ws://localhost:9090');
    ws.onmessage = function (event) {
      let data = JSON.parse(event.data)
      if (data.currentPrice) {
        currentPrice = data.currentPrice;
        console.log(data.currentPrice)
        vm.setState({currentPrice});
        // PriceChart.updatePrice(data.currentPrice)
        // console.log(PriceChart());
        // console.log('do something');
        // PriceChart.setState({currentPrice: data.currentPrice});
        // vm.state.currentPrice = data.currentPrice;
        // vm.setState({currentPrice: data.currentPrice});
      }
    };
  }

  render() {
    let currentPrice = ''
    return (
      <div className="App">
        <Header />
        <Hero />
        <PriceChart testProp={this.state.currentPrice} />
        <KeyStats />
        <Details />
      </div>
    );
  }
}

export default App;
