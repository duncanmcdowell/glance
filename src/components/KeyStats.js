import React, { Component } from 'react';
import update from 'immutability-helper';
import {Card, Row, Col} from 'antd';
import Api from '../Api';
import '../App.less';

const determineHealth = function(value, low, middle) {
  if (value < low) {
    return {'status':'healthy', 'value':'#73d13d'};
  } else if (value > low && value < middle) {
    return {'status':'moderately healthy', 'value':'#fff566'};
  } else {
    return {'status':'unhealthy', 'value':'#ff4d4f'};
  }
}

class KeyStats extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gasPrice: {
        health: {status:'', value:''},
        refresh: true,
        value: ''
      },
      latestBlock: {
        refresh: true,
        value: ''
      },
      uncomfirmedTransactions: {
        health: {status:'', value:''},
        refresh: true,
        value: ''
      }
    };
  }
  componentDidMount() {
    const vm = this;
    const getGasPrice = function() {
      let latestState = update(vm.state.gasPrice, {refresh: {$set: false}});
      vm.setState({'gasPrice' :latestState});
      Api.gasPrice().then(function(result) {
        // convert wei to gwei
        let gwei = result / 1000000000;
        if (vm.state.gasPrice.value !== gwei) {
          latestState = update(vm.state.gasPrice, {refresh: {$set: true}});
          vm.setState({'gasPrice' :latestState});
        }
        let health = determineHealth(gwei, 28, 60);
        latestState = update(vm.state.gasPrice, {value: {$set: gwei}, health: {$set: health}});
        vm.setState({'gasPrice' :latestState});
      });
    }
    // getGasPrice();
    // setInterval(getGasPrice, 10000);

    const getLatestBlock = function() {
      let latestState = update(vm.state.latestBlock, {refresh: {$set: false}});
      vm.setState({'latestBlock' :latestState});
      Api.getLastBlock().then(function(result) {
        if (vm.state.latestBlock.value !== result) {
          latestState = update(vm.state.latestBlock, {refresh: {$set: true}});
          vm.setState({'latestBlock' :latestState});
        }
        latestState = update(vm.state.latestBlock, {value: {$set: result}});
        vm.setState({'latestBlock' :latestState});
      });
    }
    // getLatestBlock();
    // setInterval(getLatestBlock, 10000);

    const getUncomfirmedTransactions = function() {
      let latestState = update(vm.state.uncomfirmedTransactions, {refresh: {$set: false}});
      vm.setState({'uncomfirmedTransactions' :latestState});
      Api.getUncomfirmedTransactions().then(function(result) {
        if (vm.state.uncomfirmedTransactions.value !== result) {
          let latestState = update(vm.state.uncomfirmedTransactions, {refresh: {$set: true}});
          vm.setState({'uncomfirmedTransactions' :latestState});
        }
        let health = determineHealth(result, 100000, 180000);
        latestState = update(vm.state.uncomfirmedTransactions, {value: {$set: result}, health: {$set: health}});
        vm.setState({'uncomfirmedTransactions' :latestState});
      });
    }
    // getUncomfirmedTransactions();
    // const uncomfirmedTransactionsInterval = setInterval(getUncomfirmedTransactions, 20000);

  }
  render() {
    return (
      <div className="KeyStats">
        <Row>
          <Col span={8}>
            <div>
              <Card title="Gas Price">
                <span className={"stats " + (this.state.gasPrice.refresh ? 'animated fadeIn' : '')}>{this.state.gasPrice.value}</span>
                <div className="health-bar" style={{background: this.state.gasPrice.health.value}} title={this.state.gasPrice.health.status}> </div>
              </Card>
            </div>
          </Col>
          <Col span={8}>
            <div>
              <Card title="Latest Block">
                <span className={"stats " + (this.state.latestBlock.refresh ? 'animated fadeIn' : '')}>{this.state.latestBlock.value}</span>
              </Card>
            </div>
          </Col>
          <Col span={8}>
            <div>
              <Card title="Uncomfirmed Txs">
                <span className={"stats " + (this.state.uncomfirmedTransactions.refresh ? 'animated fadeIn' : '')}>{this.state.uncomfirmedTransactions.value}</span>
                <div className="health-bar" style={{background: this.state.uncomfirmedTransactions.health.value}} title={this.state.uncomfirmedTransactions.health.status}></div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default KeyStats;
