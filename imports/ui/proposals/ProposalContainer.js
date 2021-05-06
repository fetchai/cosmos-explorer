import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Proposals } from '/imports/api/proposals/proposals.js';
import { Chain } from '/imports/api/chain/chain.js';
import Proposal from './Proposal.jsx';
import { Component } from 'react';

export default class ProposalContainer extends Component {

  render() {
    return withTracker((props) => {
      let proposalId = 0;
      if (props.match.params.id) {
        proposalId = parseInt(props.match.params.id);
      }

      let chainHandle; let proposalHandle; let proposalListHandle; let proposal; let proposalCount; let chain; let
        proposalExist;
      let loading = true;

      if (Meteor.isClient) {
        chainHandle = Meteor.subscribe('chain.status');
        proposalListHandle = Meteor.subscribe('proposals.list', proposalId);
        proposalHandle = Meteor.subscribe('proposals.one', proposalId);
        loading = !proposalHandle.ready() || !chainHandle.ready() || !proposalListHandle.ready();
      }

      if (Meteor.isServer || !loading) {
        proposal = Proposals.findOne({ proposalId });
        proposalCount = Proposals.find({}).count();
        chain = Chain.findOne({ chainId: Meteor.settings.public.chainId });

        if (Meteor.isServer) {
          // loading = false;
          proposalExist = !!proposal;
        } else {
          proposalExist = !loading && !!proposal;
        }
      }

      return {
        loading,
        proposalExist,
        proposal: proposalExist ? proposal : {},
        chain: proposalExist ? chain : {},
        proposalCount: proposalExist ? proposalCount : 0,
      };
    })
  }
}
