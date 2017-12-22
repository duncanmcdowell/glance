import axios from 'axios';

class Api {
  // Traditional response/request api
  // Further API-like functionality is found in App.js under the websocket connection

  static getHistoricalEthPrice() {
    return axios.get('http://localhost:8080/api/historical')
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });
  }
}

export default Api;
