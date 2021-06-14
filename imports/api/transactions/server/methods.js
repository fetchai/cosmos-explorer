import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Transactions } from '../../transactions/transactions.js';
import { Validators } from '../../validators/validators.js';

const AddressLength = 40;

Meteor.methods({
    'Transactions.updateTransactions': async function () {
        this.unblock();
        if (TXSYNCING)
            return "transactions sync already in progress...";

        const queryLimit = 100;
        let totalProcessed = 0;
        let currentProcessed = 0;
        do {
            const transactions = Transactions.find({ processed: false }, { limit: queryLimit }).fetch();
            currentProcessed = transactions.length;
            console.log("updateTransactions: found %d transactions to process", currentProcessed);
            var totalUpdated = 0;
            try {
                TXSYNCING = true;
                const bulkTransactions = Transactions.rawCollection().initializeUnorderedBulkOp();
                for (let i in transactions) {
                    try {
                        let url = API + '/cosmos/tx/v1beta1/txs/' + transactions[i].txhash;
                        let response = HTTP.get(url);
                        let tx = JSON.parse(response.content);

                        tx.height = parseInt(tx.tx_response.height);
                        tx.processed = true;

                        bulkTransactions.find({ txhash: transactions[i].txhash }).updateOne({ $set: tx });
                        totalUpdated++;
                    }
                    catch (e) {
                        console.log("updateTransactions: failed to get transaction %o: %o", transactions[i].txhash, e);
                        bulkTransactions.find({ txhash: transactions[i].txhash }).updateOne({ $set: { processed: false, missing: true } });
                    }
                }
                console.log("updateTransactions: done updating %d transactions", totalUpdated);

                if (bulkTransactions.length > 0) {
                    console.log("updateTransactions: saving %d transaction updates", bulkTransactions.length)
                    bulkTransactions.execute((err, result) => {
                        if (err) {
                            console.log("updateTransactions: failed to execute bulkTransactions", err);
                        }
                        if (result) {
                            console.log("updateTransactions: bulkTransactions success", result);
                        }
                    });
                }
            }
            catch (e) {
                TXSYNCING = false;
                return e
            }

            totalProcessed += currentProcessed;
        } while (currentProcessed >= queryLimit);

        TXSYNCING = false;
        return totalProcessed;
    },
    'Transactions.findDelegation': function (address, height) {
        this.unblock();
        // following cosmos-sdk/x/slashing/spec/06_events.md and cosmos-sdk/x/staking/spec/06_events.md
        return Transactions.find({
            $or: [{
                $and: [
                    { "tx_response.logs.events.type": "delegate" },
                    { "tx_response.logs.events.attributes.key": "validator" },
                    { "tx_response.logs.events.attributes.value": address }
                ]
            }, {
                $and: [
                    { "tx_response.logs.events.attributes.key": "action" },
                    { "tx_response.logs.events.attributes.value": "unjail" },
                    { "tx_response.logs.events.attributes.key": "sender" },
                    { "tx_response.logs.events.attributes.value": address }
                ]
            }, {
                $and: [
                    { "tx_response.logs.events.type": "create_validator" },
                    { "tx_response.logs.events.attributes.key": "validator" },
                    { "tx_response.logs.events.attributes.value": address }
                ]
            }, {
                $and: [
                    { "tx_response.logs.events.type": "unbond" },
                    { "tx_response.logs.events.attributes.key": "validator" },
                    { "tx_response.logs.events.attributes.value": address }
                ]
            }, {
                $and: [
                    { "tx_response.logs.events.type": "redelegate" },
                    { "tx_response.logs.events.attributes.key": "destination_validator" },
                    { "tx_response.logs.events.attributes.value": address }
                ]
            }],
            "tx_response.code": 0,
            height: { $lt: height }
        },
            {
                sort: { height: -1 },
                limit: 1
            }
        ).fetch();
    },
    'Transactions.findUser': function (address, fields = null) {
        this.unblock();
        // address is either delegator address or validator operator address
        let validator;
        if (!fields)
            fields = { address: 1, description: 1, operator_address: 1, delegator_address: 1 };
        if (address.includes(Meteor.settings.public.bech32PrefixValAddr)) {
            // validator operator address
            validator = Validators.findOne({ operator_address: address }, { fields });
        }
        else if (address.includes(Meteor.settings.public.bech32PrefixAccAddr)) {
            // delegator address
            validator = Validators.findOne({ delegator_address: address }, { fields });
        }
        else if (address.length === AddressLength) {
            validator = Validators.findOne({ address: address }, { fields });
        }
        if (validator) {
            return validator;
        }
        return false;

    }
});
