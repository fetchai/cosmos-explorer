import React, { Component } from 'react';
import {
  Card, CardBody, CardHeader, Col, Container, Row, Spinner,
} from 'reactstrap';
import Account from '../components/Account.jsx';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js';

const T = i18n.createComponent();

export default class ValidatorDelegations extends Component{
    constructor(props){
        super(props);
        this.state = {
            loading: true,
            numDelegatiors: 0,
            delegationsCount: 0
        }
    }

  componentDidMount() {
    Meteor.call('Validators.getAllDelegations', this.props.address, (error, result) => {
      if (error) {
        console.warn(error);
      }

            if (result){
                this.setState({delegationsCount: result, loading: false
                })
            }
        })
        let delegations = Delegations.find({}, { sort: { shares: -1 } }).fetch();
        this.setState({
          loading: false,
          numDelegatiors: delegations.length,
          delegations: delegations.map((d, i) => {
            return <Row key={i} className="delegation-info">
              <Col md={8} className="text-nowrap overflow-auto"><Account address={d.delegator_address} /></Col>
              <Col md={4}>{new Coin((d.shares / this.props.shares * this.props.tokens), this.props.denom).stakeString()}</Col>
            </Row>
          })
        })
      }
    })
  }

    render(){
        if (this.state.loading){
            return <div><Spinner type="grow" color="primary"/></div>
        }
        else{
            return <Card>
                <CardHeader><T>validators.delegations</T></CardHeader>
                <CardBody className="list">
                    <Container fluid>
                        <Row className="header text-nowrap d-none d-lg-flex">
                            <Col md={8}><span className="ml-n3"><T>common.totalNumOfDelegations</T>:</span></Col>
                            <Col md={4}><span className="font-weight-normal float-right">{this.state.delegationsCount}</span></Col>
                        </Row>
                    </Container>
                </CardBody>
            </Card>
        }
    }

    return (
      <Card>
        <CardHeader>
          {(this.state.numDelegatiors > 0) ? this.state.numDelegatiors : 'No'}
          {' '}
          <T>common.delegators</T>
          {' '}
          {(this.state.numDelegatiors > 0) ? (
            <small className="text-secondary">
              (
              {new Coin(this.props.tokens / this.state.numDelegatiors).toString(2)}
              s / delegator)
            </small>
          ) : ''}
        </CardHeader>
        <CardBody className="list">
          <Container fluid>
            <Row className="header text-nowrap d-none d-lg-flex">
              <Col md={8}>
                <i className="fas fa-at" />
                {' '}
                <span>
                  <T>common.addresses</T>
                </span>
              </Col>
              <Col md={4}>
                <i className="fas fa-piggy-bank" />
                {' '}
                <span>
                  <T>common.amounts</T>
                </span>
              </Col>
            </Row>
            {this.state.delegations}
          </Container>
        </CardBody>
      </Card>
    );
  }
}
