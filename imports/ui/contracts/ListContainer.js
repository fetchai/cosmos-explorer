import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Contracts } from '/imports/api/transactions/contracts.js';
import List from './List.jsx';
import React from 'react'

/**
 * From a single contract stored we get all all the transactions and return them as an array
 * of values that can be used in the UI where each element in the array represents a single transaction.
 *
 * @param transactions
 * @param contract_address
 * @returns {[]}
 */
      function formatTransactions(transactions, contract_address){
        let ret = [];

        (transactions.txs && transactions.txs.length) ? transactions.txs.map((tx, n) => {
             (tx.tx.value.msg && tx.tx.value.msg.length > 0) ? tx.tx.value.msg.map((msg, i) => {

            ret.push({"contract_address" : contract_address,
              "isContractTransaction" : true,
  "sender": msg.value.sender,
  "amount": tx.tx.value.fee.amount[0].amount,
  "denom": tx.tx.value.fee.amount[0].denom,
  "txhash": tx.txhash,
  "time": new Date(tx.timestamp).getTime(),
  "starting_height": tx.height })
        }) : "";
        }) : "";
        return ret;
    }

export default ValidatorDetailsContainer = withTracker((props) => {

  let transactionsHandle; let transactions; let contract; let
    transactionsExist;
  let loading = true;

  if (Meteor.isClient) {
    transactionsHandle = Meteor.subscribe('contracts.list', props.limit);
    loading = (!transactionsHandle.ready() && props.limit == Meteor.settings.public.initialPageSize);
  }

  if (Meteor.isServer || !loading) {

    if(props.contractAddress) {
      contract = Contracts.find({ contract_address: props.contractAddress }, { sort: { starting_height: -1 }, limit: props.limit }).fetch()[0];


      if(typeof contract === "undefined"){
        transactionsExist = false
      } else {
              transactions = formatTransactions(contract, props.contractAddress);
      }


    } else {
      transactions = Contracts.find({}, { sort: { starting_height: -1 } }).fetch();
    }

    if (Meteor.isServer) {
      transactionsExist = !!transactions;
    } else {
      transactionsExist = !loading && !!transactions;
    }
  }



  // isContractTransaction  is a flag to say if we are serving a page that is showing contracts or transactions relating to contract.
  return {
    loading,
    transactionsExist,
    isContractTransaction: Boolean(props.contractAddress),
    transactions: transactionsExist ? transactions : {},
    contract: Boolean(props.contractAddress) ? contract : {},
  };
})(List);
