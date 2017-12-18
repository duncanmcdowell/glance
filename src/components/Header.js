import React, { Component } from 'react';
import {Row, Col} from 'antd';
import logo from '../logo.svg';
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
          <img src={logo} alt="glance logo" width="30px" />
          <span className="wordmark"> Glance </span>
          <span className="link"> <a href="https://github.com/duncanmcdowell/glance"> documentation </a> </span>
          <span className="link"> <a href="#details"> details </a> </span>
        </Col>
      </Row>
    );
  }
}

export default Header;
