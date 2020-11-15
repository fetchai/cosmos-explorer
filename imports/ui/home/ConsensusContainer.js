import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Chain } from '/imports/api/chain/chain.js';
import Consensus from './Consensus.jsx';

export default ConsensusContainer = withTracker((curr) => {
    console.log("ConsensusContainer");

    debugger;
  let consensusHandle;
  let loading = true;
  let consensus;

  if (Meteor.isClient) {
    consensusHandle = Meteor.subscribe('chain.status');
    loading = !consensusHandle.ready();
  }

  let consensusExist;
    console.log("before consensus and loading", loading)
  if (true) {
    console.log("HERE consensus" , Meteor.settings.public.chainId)
    consensus = Chain.findOne({ chainId: Meteor.settings.public.chainId });
    console.log("HERE consensus", consensus)

    if (Meteor.isServer) {
      // loading = false;
      consensusExist = !!consensus;
          console.log("HERE consensusExist", consensusExist)

    } else {
      consensusExist = !loading && !!consensus;
                console.log("HERE2 consensusExist", consensusExist)
    }
  }


  console.log("consensusExist", consensusExist);
  return {
    loading,
    consensusExist,
    consensus: consensusExist ? consensus : {},
  };
})(Consensus);
