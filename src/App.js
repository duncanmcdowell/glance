import React, { Component } from 'react';
import KeyStats from './components/KeyStats';
import PriceChart from './components/PriceChart';
import Header from './components/Header';
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
        <PriceChart />
        <KeyStats />
      </div>
    );
  }
}

export default App;
