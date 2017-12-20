import axios from 'axios';

class Api {
  static parityEndpoint = "https://wallet.parity.io:8545"

  static getLastBlock() {
    return this.ethCall("eth_getBlockByNumber", ['latest', false], 'number');
  }

  static getHistoricalEthPrice() {
    return axios.get('http://localhost:8080/api/historical')
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
