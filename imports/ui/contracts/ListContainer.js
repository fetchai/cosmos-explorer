import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Transactions } from '/imports/api/transactions/transactions.js';
import { Contracts } from '/imports/api/transactions/contracts.js';
import List from './List.jsx';

export default ValidatorDetailsContainer = withTracker((props) => {

  console.log("ValidatorDetailsContainerValidatorDetailsContainerValidatorDetailsContainer")

  let transactionsHandle; let transactions; let
    transactionsExist;
  let loading = true;

  if (Meteor.isClient) {
      console.log("Meteor.isClientMeteor.isClient", props.limit)
    transactionsHandle = Meteor.subscribe('contracts.list', props.limit);
    loading = (!transactionsHandle.ready() && props.limit == Meteor.settings.public.initialPageSize);
  }

  if (Meteor.isServer || !loading) {
    transactions = Contracts.find({}, { sort: { height: -1 }, limit: props.limit }).fetch();

    if (Meteor.isServer) {
         console.log("Meteor.isServerMeteor.isServerMeteor.isServer")
      // loading = false;
      transactionsExist = !!transactions;
    } else {
      transactionsExist = !loading && !!transactions;
               console.log("transactionsExist", transactionsExist)
    }
  }

  return {
    loading,
    transactionsExist,
    transactions: transactionsExist ? transactions : {},
  };
})(List);
