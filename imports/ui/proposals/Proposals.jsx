import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import { Route, Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import List from './ListContainer.js';
import Proposal from './ProposalContainer.js';
import ChainStates from '../components/ChainStatesContainer.js';

const T = i18n.createComponent();

const ProposalList = (props) => (
  <div>
    <p className="lead">
      <T>proposals.listOfProposals</T>
    </p>
    <Row>
      <Col md={12}>
        <List {...props} />
      </Col>
    </Row>
  </div>
);
export default class Proposals extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Helmet>
          <title>Governance Proposals on The {Meteor.settings.public.networkDisplayName} Explorer by Fetch.ai</title>
          <meta name="description" content={`The ${Meteor.settings.public.networkDisplayName} Explorer by Fetch.ai incorporates on-chain governance. Come to see how on-chain governance can be achieved on The Network Explorer.`} />
        </Helmet>
        <Row>
          <Col md={3} xs={12}>
            <h1 className="d-none d-lg-block">
              <T>proposals.proposals</T>
            </h1>
          </Col>
          <Col md={9} xs={12} className="text-md-right">
            <ChainStates />
          </Col>
        </Row>
        <Switch>
          <Route exact path="/proposals" component={ProposalList} />
          <Route path="/proposals/:id" component={Proposal} />
        </Switch>
      </div>
    );
  }
}
export default class Proposals extends Component{
    constructor(props){
        super(props);
    }

    render() {
        return <div>
            <Helmet>
                <title>Governance Proposals on {Meteor.settings.public.chainName} | Big Dipper</title>
                <meta name="description" content="{Meteor.settings.public.chainName} incorporates on-chain governance. Come to see how on-chain governance can be achieved on Big Dipper." />
            </Helmet>
            <Row>
                <Col md={3} xs={12}><h1 className="d-none d-lg-block"><T>proposals.proposals</T></h1></Col>
                <Col md={9} xs={12} className="text-md-right"><ChainStates /></Col>
            </Row>
            <Switch>
                <Route exact path="/proposals" component={ProposalList} />
                <Route path="/proposals/:id" component={Proposal} />
            </Switch>
        </div>
    }

}
