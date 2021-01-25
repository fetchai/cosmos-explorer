import { publishComposite } from 'meteor/reywood:publish-composite';
import { Transactions } from '../transactions.js';
import { Contracts } from '../contracts.js';
import { Blockscon } from '../../blocks/blocks.js';

publishComposite('transactions.list', function(limit = 30) {
  return {
    find() {
      return Transactions.find({}, { sort: { height: -1 }, limit });
    },
    children: [
      {
        find(tx) {
          return Blockscon.find(
            { height: tx.height },
            { fields: { time: 1, height: 1 } },
          );
        },
      },
    ],
  };
});

publishComposite('contracts.list', function(limit = 30) {
  return {
    find() {
      return Contracts.find({}, { sort: { height: -1 }, limit });
    }
  };
});

publishComposite('transactions.address', function(validatorAddress, delegatorAddress, limit = 100) {
  let query = {};
  if (validatorAddress && delegatorAddress) {
    query = { $or: [{ 'logs.events.attributes.value': validatorAddress }, { 'logs.events.attributes.value': delegatorAddress }] };
  }

  if (!validatorAddress && delegatorAddress) {
    query = { 'logs.events.attributes.value': delegatorAddress };
  }

  return {
    find() {
      return Transactions.find(query, { sort: { height: -1 }, limit });
    },
    children: [
      {
        find(tx) {
          return Blockscon.find(
            { height: tx.height },
            { fields: { time: 1, height: 1 } },
          );
        },
      },
    ],
  };
});

publishComposite('transactions.findOne', function(hash) {
  return {
    find() {
      return Transactions.find({ txhash: hash });
    },
    children: [
      {
        find(tx) {
          return Blockscon.find(
            { height: tx.height },
            { fields: { time: 1, height: 1 } },
          );
        },
      },
    ],
  };
});

publishComposite('contracts.contractAddress', function(contractAddress, limit) {
  return {
    find() {
      return Contracts.find({ contract_address: contractAddress }, { sort: { height: -1 }, limit });
    }
  };
});

publishComposite('transactions.height', function(height) {
  return {
    find() {
      return Transactions.find({ height });
    },
    children: [
      {
        find(tx) {
          return Blockscon.find(
            { height: tx.height },
            { fields: { time: 1, height: 1 } },
          );
        },
      },
    ],
  };
});
