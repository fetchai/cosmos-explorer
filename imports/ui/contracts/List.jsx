import React, { Component } from 'react';
import { Col, Row, Spinner } from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import { ContractRow } from './ContractRow.jsx';
import Contract from './Contract'

const T = i18n.createComponent();
export default class Contracts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txs: '',
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props != prevProps) {
      if (this.props.transactions.length > 0) {
        this.setState({
          txs: this.props.transactions.map((tx, i) => (
            <ContractRow
              key={i}
              index={i}
              tx={tx}
            />
          )),
        });
      }
    }
  }

  render() {
    if (this.props.loading) {
      return <Spinner type="grow" color="primary" />;
    }
    if (!this.props.transactionsExist) {
      return (
        <div>
          <T>transactions.notFound</T>
        </div>
      );
    }

    return (
      <>
         {
              this.props.isContractTransaction ? <Contract loading={false} transactionExist={true} closeSidebar={false} contract={this.props.contract}/> : ""
              }
      <div className="transactions-list">
        <Row className="header text-nowrap d-none d-lg-flex margin-top-list">
          <Col xs={9} lg={6} className="max-width-45">
            <i className="material-icons">message</i>
            {' '}
            <span className="d-none d-md-inline-block">

              {this.props.isContractTransaction ? <T>transactions.transactions</T>
               : <T>contracts.contractAddresses</T>
              }

            </span>
          </Col>
          <Col xs={3} lg={{ size: 2 }} className="margin-left">
                <i className="material-icons">check_circle</i>
            {' '}
            <span className="d-none d-lg-inline-block  extra-margin-right">
              <T>transactions.valid</T>
            </span>
          </Col>
          <Col xs={4} md={1} lg={{ size: 2 }}>
            <i className="fas fa-database" />
            {' '}
            <span className="d-none d-md-inline-block  extra-margin-right">
              <T>common.height</T>
            </span>
          </Col>
          <Col xs={2} md={2} lg={5} className="text-nowrap unset-flex  extra-margin-right">
            {
              this.props.isContractTransaction ?  <><i className="fas fa-hashtag" />
            {' '}
            <span className="d-none d-md-inline-block">
              <T>transactions.txHash</T>
            </span></> :
               <> <i className="fas fa-hashtag" />
            {' '}
            <span className="d-none d-md-inline-block">
              <T>transactions.txCount</T>
            </span></>

            }
          </Col>
        </Row>
        {this.state.txs}
      </div>
              </>

    );
  }
}
