import React, { Component } from 'react';
import {
  Card, CardBody, CardHeader, Col, Container, Row,
} from 'reactstrap';
import numbro from 'numbro';
import moment from 'moment';
import i18n from 'meteor/universe:i18n';
import Account from '../components/Account.jsx';

const T = i18n.createComponent();

export default class AccountUnbondings extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const numUnbondings = this.props.unbonding.length;
    return (
      <Card>
        <CardHeader>
          {(numUnbondings > 0) ? numUnbondings + " " : <T>accounts.no</T>}
          <T>accounts.unbonding</T>
          {(numUnbondings > 1) ? <T>accounts.plural</T> : ''}
        </CardHeader>
        {(numUnbondings > 0) ? (
          <CardBody className="list overflow-auto">
            <Container fluid>
              <Row className="header text-nowrap d-none d-lg-flex">
                <Col md={5}>
                  <i className="fas fa-at" />
                  {' '}
                  <span>
                    <T>accounts.validators</T>
                  </span>
                </Col>
                <Col md={7}>
                  <Row>
                    <Col md={6}>
                      <i className="fas fa-piggy-bank" />
                      {' '}
                      <span>
                        <T>accounts.shares</T>
                      </span>
                    </Col>
                    <Col md={6}>
                      <i className="fas fa-clock" />
                      {' '}
                      <span>
                        <T>accounts.mature</T>
                      </span>
                    </Col>
                  </Row>
                </Col>
              </Row>
              {this.props.unbonding.map((u, i) => (
                <Row key={i} className="delegation-info">
                  <Col md={5} className="text-nowrap overflow-auto">
                    <Account address={u.validator_address} />
                  </Col>
                  <Col md={7}>
                    {u.entries.map((entry, j) => (
                      <Row key={j}>
                        <Col md={6}>
                          {numbro(entry.balance).format('0,0')}
                        </Col>
                        <Col md={6}>
                          {moment.utc(entry.completion_time).fromNow()}
                        </Col>
                      </Row>
                    ))}
                  </Col>
                </Row>
              ))}
            </Container>
          </CardBody>
        ) : ''}
      </Card>
    );
  }
}
