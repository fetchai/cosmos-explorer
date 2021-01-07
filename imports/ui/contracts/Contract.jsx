import React, { Component } from 'react';
import {
  Alert, Card, CardBody, Col, Container, Row, Spinner,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import numbro from 'numbro';
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';
import CosmosErrors from '../components/CosmosErrors.jsx';
import Activities from '../components/Activities.jsx';
import { TxIcon } from '../components/Icons.jsx';
import TimeStamp from '../components/TimeStamp.jsx';
import { Meteor } from 'meteor/meteor';
import Account from '../components/Account'
import { MsgType } from '../components/MsgType'




const T = i18n.createComponent();
export default class Contract extends Component {
  constructor(props) {
    super(props);
    const showdown = require('showdown');
    showdown.setFlavor('github');
  }

  render() {
    if (this.props.loading) {
      return (
        <Container id="transaction">
          <Spinner type="grow" color="primary" />
        </Container>
      );
    }

    if (this.props.transactionExist) {

      const contract = this.props.contract;
      const denom =  Meteor.settings.public.coins[0].denom;
      debugger;
      return (
        <Container id="transaction">
          <Helmet>
            <title>
              Contract  {' '}
              {contract.contract_address}

              on the Network Explorer
            </title>
            <meta name="description" content={`Details of contract ${contract.contract_address}`} />
          </Helmet>
          <h4>
            <T>contracts.contract</T>
            {' '}
            { (!contract.code) ? <TxIcon valid /> : <TxIcon />}
          </h4>
          {(contract.code) ? (
            <Row>
              <Col xs={{ size: 12, order: 'last' }} className="error">
                <Alert color="danger">
                  <CosmosErrors
                    code={contract.code}
                    logs={contract}
                    gasWanted={contract.gas_wanted}
                    gasUses={contract.gas_used}
                  />
                </Alert>
              </Col>
            </Row>
          ) : ''}
          <Card>
            <div className="card-header margin-top">
              <T>common.information</T>
            </div>
            <CardBody>
              <Row>
                <Col md={4} className="label">
                  <T>contracts.contractAddress</T>
                </Col>
                <Col md={8} className="value text-nowrap overflow-auto address">
                  {contract.contract_address}
                </Col>

                <Col md={4} className="label">
                  <T>contracts.number</T>
                </Col>
                <Col md={8} className="value text-nowrap overflow-auto address">
                  {contract.txs.length}
                </Col>
                <Col md={4} className="label">
                  <T>contracts.CreatedBy</T>
                </Col>
                <Col md={8} className="value text-nowrap overflow-auto address">
                  {contract.contract_owner}
                </Col>
                <Col md={4} className="label">
                  <T>contracts.CreatedAt</T>
                </Col>
                <Col md={8} className="value text-nowrap overflow-auto address">
                  {new Date(contracts.timestamp).toLocaleString()}
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Card className="no-border">
              <Card>
            <div className="card-header">
              <T>transactions.activities</T>
            </div>
          </Card>
            <div className="contract-box">
          {(contract.txs && contract.txs.length) ? contract.txs.map((tx, n) =>
             (tx.tx.value.msg && tx.tx.value.msg.length > 0) ? tx.tx.value.msg.map((msg, i) => (
            <Card body key={i}>
              <ul className="contract-transaction">
                <li>Transaction at  {new Date(tx.timestamp).toLocaleString()}</li>
                <li>Sender: {msg.value.sender}</li>
                <li>Amount: {tx.tx.value.fee.amount[0].amount} {tx.tx.value.fee.amount[0].denom}</li>
                <li>Raw Log: {tx.raw_log}</li>
              </ul>
            </Card>)) : '') : ''}
            </div>
              </Card>
        </Container>
      );
    }

    return (
      <Container id="transaction">
        <div>
          <T>transactions.noTxFound</T>
        </div>
      </Container>
    );
  }
}
