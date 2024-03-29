import { Meteor } from 'meteor/meteor';
import { Transactions } from '../../transactions/transactions.js';
import { Blockscon } from '../../blocks/blocks.js';

Meteor.methods({
    'Validators.findCreateValidatorTime': function (address) {
        this.unblock();
        // look up the create validator time to consider if the validator has never updated the commission
        let tx = Transactions.findOne({
            $and: [
                { "tx.body.messages.delegator_address": address },
                { "tx.body.messages.@type": "/cosmos.staking.v1beta1.MsgCreateValidator" },
                { "tx_response.code": 0 }
            ]
        });

        if (tx) {
            let block = Blockscon.findOne({ height: tx.height });
            if (block) {
                return block.time;
            }
        }
        else {
            // no such create validator tx
            return false;
        }
    },
    'Validators.getAllDelegations'(address) {
        this.unblock();

        let allDelegations = [];
        const limit = 100;
        let offset = 0;
        let total = 0;
        do {
            let url = `${API}/cosmos/staking/v1beta1/validators/${address}/delegations?pagination.limit=${limit}&pagination.offset=${offset}&pagination.count_total=1`;
            try {
                const resp = HTTP.get(url);
                const response = JSON.parse(resp.content);
                total = parseInt(response.pagination.total);
                let delegations = response.delegation_responses;
                delegations.forEach((_, i) => {
                    if (delegations[i] && delegations[i].shares)
                        delegations[i].shares = parseFloat(delegations[i].shares);
                })
                allDelegations = [...allDelegations, ...delegations];
                offset += limit;
            } catch (e) {
                console.log(url);
                console.log("Getting error: %o when getting delegations from %o", e, url);
                return [];
            }
        }
        while (allDelegations.length < total);

        return allDelegations;
    }
});
