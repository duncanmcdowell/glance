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
              This app was built on React, Ant Design and ChartJS. Several APIs provide
              data including Poloniex, BlockCypher and a publicly hosted Parity node. All API
              calls are made in browser, though with more development time it would make much more sense to
              move them to a backend server.
            </p>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Details;
