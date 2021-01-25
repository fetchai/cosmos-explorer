import React, { Component } from 'react';
import {
  Alert, Card, CardBody, Col, Container, Row, Spinner,
} from 'reactstrap';

import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';
import CosmosErrors from '../components/CosmosErrors.jsx';
import { TxIcon } from '../components/Icons.jsx';
import { Meteor } from 'meteor/meteor';
import Account from '../components/Account'



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
            <T>contracts.contractTransactions</T>
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
                    <Account address={contract.contract_address} />
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
                    <Account address={contract.contract_owner} />
                </Col>
                <Col md={4} className="label">
                  <T>contracts.CreatedAt</T>
                </Col>
                <Col md={8} className="value text-nowrap overflow-auto address">
                  {new Date(contract.time).toLocaleString()}
                </Col>
              </Row>
            </CardBody>
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
