import { Meteor } from 'meteor/meteor';
import { Transactions } from '../../transactions/transactions.js';
import { Blockscon } from '../../blocks/blocks.js';
import { LCD } from '../../../../server/main';

Meteor.methods({
  'Validators.findCreateValidatorTime'(address) {
    // look up the create validator time to consider if the validator has never updated the commission
    const tx = Transactions.findOne({
      $and: [
        { 'tx.value.msg.value.delegator_address': address },
        { 'tx.value.msg.type': 'cosmos-sdk/MsgCreateValidator' },
        { code: { $exists: false } },
      ],
    });

    if (tx) {
      const block = Blockscon.findOne({ height: tx.height });
      if (block) {
        return block.time;
      }
    } else {
      // no such create validator tx
      return false;
    }
  },
  // async 'Validators.getAllDelegations'(address){
  'Validators.getAllDelegations'(address) {
    const url = `${LCD}/staking/validators/${address}/delegations`;

    try {
      let delegations = HTTP.get(url);
      if (delegations.statusCode == 200) {
        delegations = JSON.parse(delegations.content).result;
        delegations.forEach((delegation, i) => {
          if (delegations[i] && delegations[i].shares) { delegations[i].shares = parseFloat(delegations[i].shares); }
        });

        return delegations;
      }
    } catch (e) {
      console.log(e);
    }
  },
});
