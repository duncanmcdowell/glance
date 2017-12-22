import React, { Component } from 'react';
import {Card, Row, Col} from 'antd';
import '../App.less';

// This component consumes data through properties passed down through App.js

class KeyStats extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="KeyStats">
        <Row>
          <Col md={{span: 18, offset: 3}}>
            <Col span={8}>
              <div>
                <Card title="Gas Price">
                  <span className="stats animated fade-in">{this.props.gasDetails.price}</span>
                  <div className="health-bar" style={{background: this.props.gasDetails.health.value}} title={this.props.gasDetails.health.status}> </div>
                </Card>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <Card title="Latest Block">
                  <span className="stats animated fade-in">{this.props.latestBlock}</span>
                </Card>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <Card title="Uncomfirmed Txs">
                  <span className="stats animated fade-in">{this.props.uncomfirmedTransactions.value}</span>
                  <div className="health-bar" style={{background: this.props.uncomfirmedTransactions.health.value}} title={this.props.uncomfirmedTransactions.health.status}></div>
                </Card>
              </div>
            </Col>
          </Col>
        </Row>
      </div>
    );
  }
}

export default KeyStats;
