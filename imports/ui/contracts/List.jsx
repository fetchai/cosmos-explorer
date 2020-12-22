import React, { Component } from 'react';
import { Col, Row, Spinner } from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import { ContractRow } from './ContractRow.jsx';

const T = i18n.createComponent();
export default class Contracts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txs: '',
    };
  }

  componentDidUpdate(prevProps) {
    console.log("componentDidUpdatecomponentDidUpdatecomponentDidUpdate")
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
      <div className="transactions-list">
        <Row className="header text-nowrap d-none d-lg-flex">
          <Col xs={9} lg={7}>
            <i className="material-icons">message</i>
            {' '}
            <span className="d-none d-md-inline-block">
              <T>transactions.contracts</T>
            </span>
          </Col>
          <Col xs={3} lg={{ size: 1 }}>
                <i className="material-icons">check_circle</i>
            {' '}
            <span className="d-none d-lg-inline-block">
              <T>transactions.valid</T>
            </span>
          </Col>
          <Col xs={4} md={2} lg={1}>
            <i className="fas fa-database" />
            {' '}
            <span className="d-none d-md-inline-block">
              <T>common.height</T>
            </span>
          </Col>
          <Col xs={2} md={1} className="text-nowrap">
          <i className="fas fa-hashtag" />
            {' '}
            <span className="d-none d-md-inline-block">
              <T>transactions.txHash</T>
            </span>
          </Col>
        </Row>
        {this.state.txs}
      </div>
    );
  }
}
