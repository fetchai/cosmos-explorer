import React, { Component } from 'react';
import { Col, Row } from 'reactstrap'
import { Meteor } from 'meteor/meteor';
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';
import ChainStates from '../components/ChainStatesContainer.js';

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
      contractAddress: null,
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

       const contractAddress = this.contractAddressFromURI();
                               this.setState({ contractAddress: contractAddress });

      setTimeout(() => {
      }, 3000)

    }
  }

  /**
   * in uri there can be the contract address and if it is in address then we return it else return null
   *
   * @returns {any}
   */
  contractAddressFromURI(){
    const parts = this.props.location.pathname.split('/contracts/')
    return (parts.length == 2 || !parts[1]) ? parts[1] : null
  }

    trackScrolling = () => {
      const wrappedElement = document.getElementById('contracts');
      if (this.isBottom(wrappedElement)) {

        // if it is between 1 and 10 lets not show the loadmore icon as this is shown wrongly in places when few transactions exist, and this is most prominent on contract page.
        const rowsCount = document.getElementsByClassName("contract-row").length
        if(rowsCount > 1 && rowsCount < 10){
          return;
        }
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

            {this.contractAddressFromURI()?  "" :
             <>
            <Col md={3} xs={12}>
              <h1 className="d-none d-lg-block">
                           <T>contracts.contracts</T>
              </h1>
            </Col>
            <Col md={9} xs={12} className="text-md-right">
              <ChainStates />
            </Col>
            </>
            }

          </Row>
          <List limit={this.state.limit} contractAddress={this.state.contractAddress} />
          <LoadMore show={this.state.loadmore} />
        </div>
      );
    }
}
