import React, { Component } from 'react';
import {Row, Col} from 'antd';
import '../App.less';

class Hero extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <Row>
        <Col className="Hero" md={{span:10 ,offset:2}} >
          <h2><span>Glance</span> displays real-time statistics from the Ethereum blockchain driven by multiple APIs.</h2>
        </Col>
      </Row>
    );
  }
}

export default Hero;
