import React, { Component } from 'react';
import {Row, Col} from 'antd';
import '../App.less';

class Details extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <div className="Details">
        <Row>
          <Col span={20} offset={2}>
            <h2>Details</h2>
            <p>
              This app was built on React, Ant Design, ChartJS and is served by a node server connected to a mongoDB instance.
              Several APIs provide data including Poloniex, BlockCypher and a publicly hosted Parity node. With the exception of
              the price history information, all data is pushed to the browser via the native HTML5 websockets implementation.
            </p>
            <p>
              Health information for gas price and uncomfirmed transactions is calculated each time new information is sent, and
              when combined, is meant to give a quick indication of the current state of the Ethereum network as a whole.
            </p>
            <p>
              There are multiple sites on the web which provide the information seen above, and much more. This app was built
              so that I could become familiar with some of the existing Ethereum community APIs. Future iterations will include
              more unique, advanced tools, including the ability to estimate gas costs of a given smart contract on a function-by-function basis.
            </p>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Details;
