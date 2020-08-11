import React, { Component } from 'react';
import {
  Card, CardBody, Col, Container, Row, Spinner,
} from 'reactstrap';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';
import numbro from 'numbro';
import moment from 'moment';
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';
import Avatar from '../components/Avatar.jsx';
import TranactionTabs from '../transactions/TransactionTabs.jsx';
import TimeStamp from '../components/TimeStamp.jsx';

const T = i18n.createComponent();
export default class Block extends Component {
  constructor(props) {
    super(props);

    this.state = {
      transferTxs: {},
      stakingTxs: {},
      distributionTxs: {},
      governanceTxs: {},
      slashingTxs: {},
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      if (this.props.transactionsExist) {
        // console.log("have txs.");
        this.setState({
          transferTxs: this.props.transferTxs,
          stakingTxs: this.props.stakingTxs,
          distributionTxs: this.props.distributionTxs,
          governanceTxs: this.props.governanceTxs,
          slashingTxs: this.props.slashingTxs,
        });
      }
    }
  }

  render() {
    if (this.props.loading) {
      return (
        <Container id="block">
          <Spinner type="grow" color="primary" />
        </Container>
      );
    }

    if (this.props.blockExist) {
      // console.log(this.props.block);
      const { block } = this.props;
      const proposer = block.proposer();
      const moniker = proposer ? proposer.description.moniker : '';
      const profileUrl = proposer ? proposer.profile_url : '';

      return (
        <Container id="block">
          <Helmet>
            <title>
              Block
              {numbro(block.height).format('0,0')}
              {' '}
              {Meteor.settings.public.networkDisplayName} Explorer
            </title>
            <meta name="description" content={`Block details of height ${numbro(block.height).format('0,0')}`} />
          </Helmet>
          <h4>
            <T>blocks.block</T>
            {' '}
            {numbro(block.height).format('0,0')}
          </h4>
          <Card>
            <div className="card-header">
              <T>common.information</T>
            </div>
            <CardBody>
              <Row>
                <Col md={4} className="label">
                  <T>common.hash</T>
                </Col>
                <Col md={8} className="value text-nowrap overflow-auto address">
                  {block.hash}
                </Col>
                <Col md={4} className="label">
                  <T>blocks.proposer</T>
                </Col>
                <Col md={8} className="value">
                  <Link to={`/validator/${(proposer) ? proposer.operator_address : ''}`}>
                    <Avatar moniker={moniker} profileUrl={profileUrl} address={block.proposerAddress} list />
                    {' '}
                    {moniker}
                  </Link>
                </Col>
                <Col md={4} className="label">
                  <T>blocks.numOfTransactions</T>
                </Col>
                <Col md={8} className="value">
                  {numbro(block.transNum).format('0,0')}
                </Col>
                <Col md={4} className="label">
                  <T>common.time</T>
                </Col>
                <Col md={8} className="value">
                  <TimeStamp time={block.time} />
                  {' '}
                  (
                  {moment(block.time).fromNow()}
                  )
                </Col>
              </Row>
            </CardBody>
          </Card>
          //todo put dkg as state for consistency
          <TranactionTabs
            transferTxs={this.state.transferTxs}
            stakingTxs={this.state.stakingTxs}
            distributionTxs={this.state.distributionTxs}
            governanceTxs={this.state.governanceTxs}
            slashingTxs={this.state.slashingTxs}
            DKG={block.dkg}
          />
        </Container>
      );
    }

    return (
      <Container id="block">
        <div>
          <T>block.notFound</T>
        </div>
      </Container>
    );
  }
}