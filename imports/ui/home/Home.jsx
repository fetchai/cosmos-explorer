import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Col, Row } from 'reactstrap';
import { Helmet } from 'react-helmet';
import ChainStatus from './ChainStatusContainer.js';
import ChainInfo from '../components/ChainInfo.jsx';
import Consensus from './ConsensusContainer.js';
import TopValidators from './TopValidatorsContainer.js';
import Chart from './ChartContainer.js';


export default class Home extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="home">
        <Helmet>
          <title> {Meteor.settings.public.networkDisplayName} by Fetch.ai</title>
          <meta name="description" content="Cosmos is a decentralized network of independent parallel blockchains, each powered by BFT consensus algorithms like Tendermint consensus." />
        </Helmet>
        <ChainInfo />
        <Consensus />
        <ChainStatus />
        <Row>
          <Col md={6}>
            <TopValidators />
          </Col>
          <Col md={6}>
            <Chart />
          </Col>
        </Row>
      </div>
    );
  }
}
