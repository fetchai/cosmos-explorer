import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import {flatten} from 'flat';
import { Transactions } from '../transactions.js';
import { Contracts } from '../contracts.js';
import { Validators } from '../../validators/validators.js';
import { LCD } from '../../../../server/main';

/**
 * Makes array unique
 *
 * @param myArray
 * @returns {any[]}
 */
function unique(myArray) {
  return [...new Set(myArray)];
};

const AddressLength = 40;

const isContractTransaction = (tx) => {
  return JSON.stringify(tx).includes('contract')
}

/**
 * finds field called "contract_address" from raw log
 *
 * @param tx
 * @returns {*}
 */
function getContractAddressFromTX(tx){
  console.log("getContractAddressFromTX")
  const flattened = flatten(tx);

  let nextValueIsAddress = false

  let contractAddresses = null;
    Object.entries(flattened).forEach(([key, value]) => {

	if(nextValueIsAddress) {
	  contractAddresses = value;
    nextValueIsAddress = false
  }

	if(value === "contract_address") {
nextValueIsAddress = true
  }
});

return contractAddresses
}


 function getBlockTime(height){
  console.log("getBlockTime")
  const url = `${RPC}//block?height=${height}`;
    const response =  HTTP.get(url);
    const tx = JSON.parse(response.content);
   return tx.time
}

function getAttributeFromTX(tx, attributeName){
  console.log("getSenderFromTX")
  const flattened = flatten(tx);

  let nextValueIsAddress = false

  let senderAddress = "";
    Object.entries(flattened).forEach(([key, value]) => {
	console.log("getSenderFromTX key",  value);
	console.log(key, value);

	if(nextValueIsAddress) {
	  senderAddress = value;
    nextValueIsAddress = false
  }

	if(value === attributeName) {
nextValueIsAddress = true
  }
});

return senderAddress
}

Meteor.methods({
  'Transactions.index'(hash, blockTime) {
    this.unblock();
    hash = hash.toUpperCase();
    const url = `${LCD}/txs/${hash}`;
    const response = HTTP.get(url);
    const tx = JSON.parse(response.content);

    console.log(hash);

    tx.height = parseInt(tx.height);

    if(isContractTransaction(tx)) {

      const address = getContractAddressFromTX(tx);

      // is logic here good as results discarded todo check the logic.
       const contract = Contracts.findOne({
          contract_address:
            address
        })

        const ContractExists = !!contract;

        if (ContractExists) {
          // update
          Contracts.update(
            { contract_address: address },
            { $push: { txs: tx } },
          )

        } else {
          // get sender as owner
          let owner = getAttributeFromTX(tx, "sender")
          // else get signer and consider that the owner
          if(!owner){
                       owner = getAttributeFromTX(tx, "signer")
          }
          Contracts.insert({
            contract_address: address,
            contract_owner: owner,
            time: tx.timestamp,
            starting_height: tx.height,
            txs: [
              tx
            ]
          })

        }
      }

    const txId = Transactions.insert(tx);

    if (txId) {
      return txId;
    }
    return false;
  },

  'Transactions.findDelegation'(address, height) {
    // following cosmos-sdk/x/slashing/spec/06_events.md and cosmos-sdk/x/staking/spec/06_events.md
    return Transactions.find({
      $or: [{
        $and: [
          { 'events.type': 'delegate' },
          { 'events.attributes.key': 'validator' },
          { 'events.attributes.value': address },
        ],
      }, {
        $and: [
          { 'events.attributes.key': 'action' },
          { 'events.attributes.value': 'unjail' },
          { 'events.attributes.key': 'sender' },
          { 'events.attributes.value': address },
        ],
      }, {
        $and: [
          { 'events.type': 'create_validator' },
          { 'events.attributes.key': 'validator' },
          { 'events.attributes.value': address },
        ],
      }, {
        $and: [
          { 'events.type': 'unbond' },
          { 'events.attributes.key': 'validator' },
          { 'events.attributes.value': address },
        ],
      }, {
        $and: [
          { 'events.type': 'redelegate' },
          { 'events.attributes.key': 'destination_validator' },
          { 'events.attributes.value': address },
        ],
      }],
      code: { $exists: false },
      height: { $lt: height },
    },
    {
      sort: { height: -1 },
      limit: 1,
    }).fetch();
  },
  'Transactions.findUser'(address, fields = null) {
    // address is either delegator address or validator operator address
    let validator;
    if (!fields) {
      fields = {
        address: 1, description: 1, operator_address: 1, delegator_address: 1,
      };
    }
    if (address.includes(Meteor.settings.public.bech32PrefixValAddr)) {
      // validator operator address
      validator = Validators.findOne({ operator_address: address }, { fields });
    } else if (address.includes(Meteor.settings.public.bech32PrefixAccAddr)) {
      // delegator address
      validator = Validators.findOne({ delegator_address: address }, { fields });
    } else if (address.length === AddressLength) {
      validator = Validators.findOne({ address }, { fields });
    }
    if (validator) {
      return validator;
    }
    return false;
  },
});
