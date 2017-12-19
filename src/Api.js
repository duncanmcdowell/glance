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
        return {'error': error};
      });
  }

  static gasPrice() {
    return this.ethCall("eth_gasPrice", []);
  }

  static getLastBlock() {
    return this.ethCall("eth_getBlockByNumber", ['latest', false], 'number');
  }

  static getBalance(address) {
    if (address.length == 40) {
      address = '0x' + address;
    }
    return this.ethCall("eth_getBalance", [address]);
  }

  static getHistoricalEthPrice() {
    return axios.get('http://localhost:8080/api/historical')
      .then(function (response) {
        console.log(response);
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

  static getNewsItems() {
    return axios.get('http://webhose.io/filterWebContent?token=8b783afd-c348-436d-8913-1e1450d86f00&format=json&ts=1511830330016&sort=crawled&q=ethereum%20social.facebook.shares%3A%3E5000')
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return {'error':error};
      });
  }

}

export default Api;
