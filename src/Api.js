import axios from 'axios';

class Api {
  static state = {
    endpoint: "https://wallet.parity.io:8545",
    gasPrice: 0,
    date: new Date()
  };

  static ethCall(method, params, respKey) {
    // method defines the specific eth JSON-RPC methods (https://github.com/paritytech/parity/wiki/JSONRPC-eth-module#eth_getblockbynumber)
    // params are dependent on the method chosen above
    // respKey defines the desired key used if response.data.result is an object, defaults to response.data.result
    return axios.post(this.state.endpoint, {
      "method":method,"params":params,"id":1,"jsonrpc":"2.0"
    })
      .then(function (response) {
        respKey = respKey ? response.data.result[respKey] : response.data.result;
        return parseInt(respKey, 16);
      })
      .catch(function (error) {
        return error;
      });
  }

  static gasPrice() {
    return this.ethCall("eth_gasPrice", []);
  }

  static getLastBlock() {
    return this.ethCall("eth_getBlockByNumber", ['latest', false], 'number');
  }

  static getHistoricalEthPrice() {
    return axios.get('https://poloniex.com/public', {
      params: {
        command:'returnChartData',
        currencyPair: 'USDT_ETH',
        start: 1511281600,
        end: 9999999999,
        period: 14400
      }
    })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error
      });
  }

  static getCurrentEthPrice() {
    return axios.get('https://poloniex.com/public', {
      params: {
        command:'returnTicker'
      }
    })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error
      });
  }

  static getUncomfirmedTransactions() {
    return axios.get('https://api.blockcypher.com/v1/eth/main')
      .then(function (response) {
        return response.data.unconfirmed_count;
      })
      .catch(function (error) {
        return error
      });
  }

}

export default Api;
