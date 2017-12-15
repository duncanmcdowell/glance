import React, { Component } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PriceChart from './components/PriceChart';
import KeyStats from './components/KeyStats';
import './App.less';

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
      </div>
    );
  }
}

export default App;
