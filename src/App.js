import React, { Component } from 'react';
import {Card, Row, Col} from 'antd';
import Api from './components/Api';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }
  componentDidMount() {
    console.log(Api.gasPrice());
  }
  render() {
    return (
      <div className="App">
        <Api />
        <div className="gutter-example">
          <Row gutter={16}>
            <Col className="gutter-row" span={6}>
              <div className="gutter-box">
                <Card title="Gas Price">{this.state.gasPrice}</Card>
              </div>
            </Col>
            <Col className="gutter-row" span={6}>
              <div className="gutter-box">
                <Card title="Card title">Card content</Card>
              </div>
            </Col>
            <Col className="gutter-row" span={6}>
              <div className="gutter-box">
                <Card title="Card title">Card content</Card>
              </div>
            </Col>
            <Col className="gutter-row" span={6}>
              <div className="gutter-box">
                <Card title="Card title">Card content</Card>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default App;
