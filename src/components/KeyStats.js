import React, { Component } from 'react';
import {Card, Row, Col} from 'antd';
import loadingIcon from '../loading.svg';
import Api from '../Api';
import '../App.less';

class KeyStats extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gasPrice: {
        loading: true,
        value: ''
      },
      latestBlock: {
        loading: true,
        value: ''
      },
      uncomfirmedTransactions: {
        loading: true,
        value: ''
      }
    };
  }
  componentDidMount() {
    const vm = this;
    Api.gasPrice().then(function(result) {
      vm.setState({gasPrice: {'value':result / 1000000000, 'loading': false}});
    });

    const getLatestBlock = function() {
      vm.setState({latestBlock: {'loading': true}});
      Api.getLastBlock().then(function(result) {
        vm.setState({latestBlock: {'value':result, 'loading': false}});
      });
    }
    getLatestBlock();
    // const blockInterval = setInterval(getLatestBlock, 10000);

    const getUncomfirmedTransactions = function() {
      vm.setState({uncomfirmedTransactions: {'loading': true}});
      Api.getUncomfirmedTransactions().then(function(result) {
        vm.setState({uncomfirmedTransactions: {'value':result, 'loading': false}});
      });
    }
    getUncomfirmedTransactions();
    // const uncomfirmedTransactionsInterval = setInterval(getUncomfirmedTransactions, 20000);

  }
  render() {
    return (
      <div className="KeyStats">
        <Row>
          <Col span={8}>
            <div>
              <Card title="Gas Price">
                {this.state.gasPrice.loading ? (
                  <img width="30px" src={loadingIcon} alt="loading..." />
                ) : (
                  <span>{this.state.gasPrice.value}</span>
                )}
              </Card>
            </div>
          </Col>
          <Col span={8}>
            <div>
              <Card title="Latest Block">
                {this.state.latestBlock.loading ? (
                  <img width="30px" src={loadingIcon} alt="loading..." />
                ) : (
                  <span>{this.state.latestBlock.value}</span>
                )}
              </Card>
            </div>
          </Col>
          <Col span={8}>
            <div>
              <Card title="Uncomfirmed Txs">
                {this.state.uncomfirmedTransactions.loading ? (
                  <img width="30px" src={loadingIcon} alt="loading..." />
                ) : (
                  <span>{this.state.uncomfirmedTransactions.value}</span>
                )}
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default KeyStats;
