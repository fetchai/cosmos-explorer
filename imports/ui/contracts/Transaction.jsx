import React, { Component } from 'react';
import {
  Alert, Card, CardBody, Col, Container, Row, Spinner,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import { Markdown } from 'react-showdown';
import numbro from 'numbro';
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';
import CosmosErrors from '../components/CosmosErrors.jsx';
import Activities from '../components/Activities.jsx';
import { TxIcon } from '../components/Icons.jsx';
import Coin from '/both/utils/coins.js';
import TimeStamp from '../components/TimeStamp.jsx';

const T = i18n.createComponent();
export default class Transaction extends Component {
  constructor(props) {
    super(props);
    const showdown = require('showdown');
    showdown.setFlavor('github');
    const { denom } = this.props;
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
      return (
        <Container id="transaction">
          <Helmet>
            <title>
              Contract
              {contract.contract_address}
              {' '}
              on the Network Explorer
            </title>
            <meta name="description" content={`Details of contract ${contract.contract_address}`} />
          </Helmet>
          <h4>
            <T>transactions.transaction</T>
            {' '}
            {(!contract.code) ? <TxIcon valid /> : <TxIcon />}
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
              <T>common.information</T>  <T>common.information</T>
            </div>
            <CardBody>
              <Row>
                <Col md={4} className="label">
                  <T>common.hash</T>
                </Col>
                <Col md={8} className="value text-nowrap overflow-auto address">
                  {contract.txhash}
                </Col>
                <Col md={4} className="label">
                  <T>common.height</T>
                </Col>
                <Col md={8} className="value">
                  <Link to={`/blocks/${contract.height}`}>
                    {numbro(contract.height).format('0,0')}
                  </Link>
                  {contract.block() ? (
                    <span>
                      {' '}
                      <TimeStamp time={contract.block().time} />
                    </span>
                  ) : null}
                </Col>
                <Col md={4} className="label">
                  <T>transactions.fee</T>
                </Col>
                <Col md={8} className="value">
                  {(contract.tx.value.fee.amount.length > 0) ? contract.tx.value.fee.amount.map((fee, i) => (
                    <span className="text-nowrap" key={i}>
                      {' '}
                      {((fee.amount / Meteor.settings.public.stakingFraction) >= 1) ? (new Coin(parseFloat(fee.amount), fee.denom)).stakeString() : (new Coin(parseFloat(fee.amount), fee.denom)).mintString()}
                      {' '}
                    </span>
                  )) : (
                    <span>
                      <T>transactions.noFee</T>
                    </span>
                  )}
                </Col>
                <Col md={4} className="label">
                  <T>transactions.gasUsedWanted</T>
                </Col>
                <Col md={8} className="value">
                  {numbro(contract.gas_used).format('0,0')}
                  {' '}
                  /
                  {' '}
                  {numbro(contract.gas_wanted).format('0,0')}
                </Col>
                <Col md={4} className="label">
                  <T>transactions.memo</T>
                </Col>
                <Col md={8} className="value">
                  <Markdown markup={contract.tx.value.memo} />
                </Col>

              </Row>
            </CardBody>
          </Card>
          <Card>
            <div className="card-header">
              <T>transactions.activities</T>
            </div>
          </Card>
          {(contract.tx.value.msg && contract.tx.value.msg.length > 0) ? contract.tx.value.msg.map((msg, i) => (
            <Card body key={i}>
              <Activities msg={msg} invalid={(!!contract.code)} events={contract.events} denom={this.denom} tx={contract}/>
            </Card>
          )) : ''}
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
