import React, { Component } from 'react';
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
      currentPrice: '',
      gasPrice: ''
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
      if (data.gasPrice) {
        let gasPrice = data.gasPrice;
        vm.setState({gasPrice});
      }
    };
  }

  render() {
    return (
      <div className="App">
        <Header />
        <Hero />
        <PriceChart currentPrice={this.state.currentPrice} />
        <KeyStats gasPrice={this.state.gasPrice}  />
        <Details />
      </div>
    );
  }
}

export default App;
