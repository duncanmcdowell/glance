import React, { Component } from 'react';
import {Row, Col} from 'antd';
import '../App.less';

class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <Row>
        <Col className="Header" span={24}>
        </Col>
      </Row>
    );
  }
}

export default Header;
