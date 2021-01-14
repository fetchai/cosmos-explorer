import React, { Component } from 'react';
import { CardHeader, Col, Row } from 'reactstrap'
import { Meteor } from 'meteor/meteor';
import { Route, Switch } from 'react-router-dom';
import Sidebar from 'react-sidebar';
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';
import ChainStates from '../components/ChainStatesContainer.js';
import Transaction from './TransactionContainer.js';
import { LoadMore } from '../components/LoadMore.jsx';
import List from './ListContainer.js';

const T = i18n.createComponent();

export default class Contracts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      limit: Meteor.settings.public.initialPageSize,
      monikerDir: 1,
      votingPowerDir: -1,
      uptimeDir: -1,
      proposerDir: -1,
      priority: 2,
      loadmore: false,
      sidebarOpen: (props.location.pathname.split('/contracts/').length == 2),
    };

    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
  }

  isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight;
  }

  componentDidMount() {
    document.addEventListener('scroll', this.trackScrolling);
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.trackScrolling);
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname != prevProps.location.pathname) {
      this.setState({
        sidebarOpen: (this.props.location.pathname.split('/contracts/').length == 2),
      });

      setTimeout(() => {
      }, 3000)

    }
  }




    trackScrolling = () => {
      const wrappedElement = document.getElementById('contracts');
      if (this.isBottom(wrappedElement)) {
        // console.log('header bottom reached');
        document.removeEventListener('scroll', this.trackScrolling);
        this.setState({ loadmore: true });
        this.setState({
          limit: this.state.limit + 10,
        }, (err, result) => {
          if (!err) {
            document.addEventListener('scroll', this.trackScrolling);
          }
          if (result) {
            this.setState({ loadmore: false });
          }
        });
      }
    };

    onSetSidebarOpen(open) {
      // console.log(open);
      this.setState({ sidebarOpen: open }, (error, result) => {
        const timer = Meteor.setTimeout(() => {
          if (!open) {
            this.props.history.push('/contracts');
          }
          Meteor.clearTimeout(timer);
        }, 500);
      });
    }

      closeSidebar () {
       this.setState({
        sidebarOpen: false,
      })
  };

    render() {
      return (
        <div id="contracts">
          <Helmet>
            <title>Latest Transactions on the Fetch.ai Network Explorer</title>
            <meta name="description" content="See what is happening on Cosmos Hub" />
          </Helmet>
          <Row>
            <Col md={3} xs={12}>
              <h1 className="d-none d-lg-block">
                           <T>contracts.contracts</T>
              </h1>
            </Col>
            <Col md={9} xs={12} className="text-md-right">
              <ChainStates />
            </Col>
          </Row>
          <Switch>
            <Route
              path="/contracts/:contract_address"
              render={(props) => (
                <Sidebar
                  sidebar={<Transaction {...props, closeSidebar: closeSidebar.bind(this)} />}
                  open={this.state.sidebarOpen}
                  onSetOpen={this.onSetSidebarOpen}
                  styles={{
                    sidebar: {
                      background: 'white',
                      position: 'fixed',
                      width: '100%',
                      zIndex: 4,
                    },
                    overlay: {
                      zIndex: 3,
                    },
                  }}
                />
              )}
            />
          </Switch>
          <List limit={this.state.limit} />
          <LoadMore show={this.state.loadmore} />
        </div>
      );
    }
}
