import React, { Component } from 'react';
import KeyStats from './components/KeyStats';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }
  render() {
    return (
      <div className="App">
        <KeyStats />
      </div>
    );
  }
}

export default App;
