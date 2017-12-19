import React, { Component } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PriceChart from './components/PriceChart';
import KeyStats from './components/KeyStats';
import Details from './components/Details';
import './App.less';

var ws = new WebSocket('ws://localhost:9999');
ws.onmessage = function (event) {
  console.log(event.data);
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <div className="App">
        <Header />
        <Hero />
        <PriceChart />
        <KeyStats />
        <Details />
      </div>
    );
  }
}

export default App;
