import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import { Helmet } from 'react-helmet';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import TwentyEighty from './TwentyEightyContainer.js';
import ThirtyFour from './ThirtyFourContainer.js';
import VotingPower from './VotingPowerContainer.js';
import ChainStates from '../components/ChainStatesContainer.js';

const T = i18n.createComponent();

export default class Distribution extends Component {
  constructor(props) {
    super(props);
  }

    render(){
        return <div id="voting-power-dist">
            <Helmet>
                <title>Voting Power Distribution on {Meteor.settings.public.chainName} | Big Dipper</title>
                <meta name="description" content="We would like to keep track how voting power are distributed over time among validators." />
            </Helmet>
            <Row>
                <Col md={3} xs={12}><h1 className="d-none d-lg-block"><T>votingPower.distribution</T></h1></Col>
                <Col md={9} xs={12} className="text-md-right"><ChainStates /></Col>
            </Row>
            <Row>
                <Col md={6}><TwentyEighty /></Col>
                <Col md={6}><ThirtyFour /></Col>
            </Row>
            <Row>
                <Col>
                    <VotingPower />
                </Col>
            </Row>

      </div>
    );
  }
}
