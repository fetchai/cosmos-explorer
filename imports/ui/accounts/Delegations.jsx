import React, { Component } from 'react';
import {
  Card, CardBody, CardHeader, Col, Container, Row,
} from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import AccountTooltip from '../components/AccountTooltip.jsx';
import Coin from '/both/utils/coins.js';
import SentryBoundary from '../components/SentryBoundary.jsx';

const T = i18n.createComponent();


export default class AccountDelegations extends Component {
  constructor(props) {
    super(props);
  }


  render() {
    const numDelegations = this.props.delegations.length;
    const denomType = this.props.denom;
    let rewardDenom = '';

    return (
      <Card>
        <CardHeader>
          {(numDelegations > 0) ? numDelegations : <T>accounts.no</T>}
          {' '}
          <T>accounts.delegation</T>
          {(numDelegations > 1) ? <T>accounts.plural</T> : ''}
        </CardHeader>
        {(numDelegations > 0) ? (
          <CardBody className="list overflow-auto">
            <Container fluid>
              <Row className="header text-nowrap d-none d-lg-flex">
                <Col xs={7} md={5}>
                  <i className="fas fa-at" />
                  {' '}
                  <span>
                    <T>accounts.validators</T>
                  </span>
                </Col>

                <Col xs={2} md={3}>
                  <i className="fas fa-wallet" />
                  {' '}
                  <span>
                    <T>
                      {Coin.StakingCoin.displayNamePlural}
                    </T>
                  </span>
                </Col>
                <Col xs={3} md={4}>
                  <i className="fas fa-gift" />
                  {' '}
                  <span>
                    <T>common.rewards</T>
                  </span>
                </Col>
              </Row>
              <SentryBoundary>
                {this.props.delegations.sort((b, a) => (a.balance - b.balance)).map((d, i) => {
                  const reward = this.props.rewardsForEachDel[d.validator_address];
                  rewardDenom = (reward) ? reward.find(({ denom }) => denom === denomType) : null;

                  return (
                    <Row key={i} className="delegation-info">
                      <Col xs={7} md={5} className="text-nowrap overflow-auto">
                        <AccountTooltip address={d.validator_address} />
                      </Col>
                      <Col xs={2} md={3}>
                        {new Coin(d.balance.amount, denomType).stakeString()}
                      </Col>
                      <Col xs={3} md={4}>
                        {rewardDenom ? new Coin(rewardDenom.amount, rewardDenom.denom).toString(4) : 'No rewards '}
                        {' '}
                      </Col>
                    </Row>
                  );
                })}
              </SentryBoundary>
            </Container>
          </CardBody>
        ) : ''}
      </Card>
    );
  }
}
