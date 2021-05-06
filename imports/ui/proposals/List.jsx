import React, { Component } from 'react';
import { Table, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import { DenomSymbol, ProposalStatusIcon } from '../components/Icons.jsx';
import numbro from 'numbro';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js'
import TimeStamp from '../components/TimeStamp.jsx';
// import { SubmitProposalButton } from '../ledger/LedgerActions.jsx';
import voca from 'voca';

const T = i18n.createComponent();

const ProposalRow = (props) => (
  <tr>
    <th className="d-none d-sm-table-cell counter">
      {props.proposal.proposalId}
    </th>
    <td className="title">
      <Link to={`/proposals/${props.proposal.proposalId}`}>
        {props.proposal.content.value.title}
      </Link>
    </td>
    <td className="status">
      <ProposalStatusIcon status={props.proposal.proposal_status} />
      <span className="d-none d-sm-inline">
        {props.proposal.proposal_status.match(/[A-Z]+[^A-Z]*|[^A-Z]+/g).join(' ')}
      </span>
    </td>
    <td className="submit-block">
      <TimeStamp time={props.proposal.submit_time} />
    </td>
    <td className="voting-start">
      {(props.proposal.voting_start_time != '0001-01-01T00:00:00Z') ? <TimeStamp time={props.proposal.voting_start_time} /> : 'Not started'}
    </td>
    <td className="deposit text-right">
      {props.proposal.total_deposit ? props.proposal.total_deposit.map((deposit, i) => (
        <div key={i}>
          {new Coin(deposit.amount, deposit.denom).toString()}
        </div>
      )) : '0'}
    </td>
  </tr>
);

export default class List extends Component {
  constructor(props) {
    super(props);
    if (Meteor.isServer) {
      if (this.props.proposals.length > 0) {
        this.state = {
          proposals: this.props.proposals.map((proposal, i) => {
            return <ProposalRow key={i} index={i} proposal={proposal} />
          })
        }
      }
    }
    else {
      this.state = {
        proposals: null
      }
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (state.user !== localStorage.getItem(CURRENTUSERADDR)) {
      return { user: localStorage.getItem(CURRENTUSERADDR) };
    }
    return null;
  }

  componentDidUpdate(prevState) {
    if (this.props.proposals != prevState.proposals) {
      if (this.props.proposals.length > 0) {
        this.setState({
          proposals: this.props.proposals.map((proposal, i) => {
            return <ProposalRow key={i} index={i} proposal={proposal} />
          })
        })
      }
    }
  }

  render() {
    if (this.props.loading) {
      return <Spinner type="grow" color="primary" />;
    }
  }
}
