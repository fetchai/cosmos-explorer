import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Contracts } from '/imports/api/transactions/contracts.js';
import Contract from './Contract.jsx';

export default TransactionContainer = withTracker((props) => {
  // const txId = props.match.params.txId.toUpperCase();

  const urlBits =  window.location.href.split('/');
  const contractAddress = urlBits[urlBits.length - 1];

  console.log("urlBits", urlBits.toString())
  console.log("contractAddress", contractAddress)


  let transactionsHandle; let contract; let
    transactionExist;
  let loading = false;

  if (Meteor.isClient) {
    transactionsHandle = Meteor.subscribe('contracts.findOne', contractAddress);
    loading = !transactionsHandle.ready();
  }

  if (Meteor.isServer || !loading) {
    contract = Contracts.findOne({ contract_address: contractAddress });

    if (Meteor.isServer) {
      loading = false;
      transactionExist = !!contract;
    } else {
      transactionExist = !loading && !!contract;
    }
    if (props.location.search === '?new' && !transactionExist) {
      loading = true;
    }
  }

  return {
    loading,
    transactionExist,
    closeSidebar:
    contract: transactionExist ? contract : {},
  };
})(Contract);
