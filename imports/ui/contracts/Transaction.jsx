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

      const  denom  = this.props.denom;
      const contract = this.props.contract;
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
                  <T>contracts.CreatedAt</T>
                </Col>
                <Col md={8} className="value text-nowrap overflow-auto address">
                  {contract.contract_address}
                </Col>
                <Col md={4} className="label">
                  <T>contracts.CreatedBy</T>
                </Col>
                <Col md={8} className="value text-nowrap overflow-auto address">
                  {contract.time}
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Card>
              <Card>
            <div className="card-header">
              <T>transactions.activities</T>
            </div>
          </Card>
          {(contract.txs && contract.txs.length) ? contract.txs.map((tx, i) =>
             (tx.tx.value.msg && tx.tx.value.msg.length > 0) ? tx.tx.value.msg.map((msg, i) => (
            <Card body key={i}>
              {" gggg"}
              {"qwerty"}{msg.type.toString()}
              {"qwerty2"}{!!tx.code}
              {"qwerty3"}{tx.events ? tx.events.toString() : ""}
              {"qwerty4"}{denom}
              {"qwerty5"}{tx.toString()}
              <Activities msg={msg} invalid={(!!tx.code)} events={tx.events} denom={denom} tx={tx}/>
            </Card>)) : '') : ''}
              </Card>
          {/*   {(typeof contract.txs !== "undefined" && contract.txs.length) ? contract.txs.map((tx, i) => (*/}
          {/*  <Card body key={i}>*/}
          {/*    <Activities msg={""} invalid={(!!tx.tx.code)} events={tx.tx.events} denom={this.denom}  tx={tx.tx}/>*/}
          {/*  </Card>*/}
          {/*)) : ''}*/}
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
