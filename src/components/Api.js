import React, { Component } from 'react';
import axios from 'axios';

class Api extends Component {
  constructor(props) {
    super(props);

    this.state = {
      endpoint: "https://wallet.parity.io:8545",
      gasPrice: 0,
      date: new Date()
    };
  }

  componentDidMount() {
    const state = this;
    this.gasPrice().then(function(result) {
      // wei to Gwei conversion
      state.setState({gasPrice: result / 1000000000})
    });
  }

  ethCall(method, params) {
    return axios.post(this.state.endpoint, {
      "method":method,"params":params,"id":1,"jsonrpc":"2.0"
    })
      .then(function (response) {
        return parseInt(response.data.result, 16);
      })
      .catch(function (error) {
        return error;
      });
  }

  gasPrice() {
    return this.ethCall("eth_gasPrice", []);
  }

  render() {
    return (
      <div>
        <h1>hello it is {this.state.date.toLocaleTimeString()}</h1>
        <div>gas price is {this.state.gasPrice}</div>
      </div>
    );
  }
}

export default Api;
