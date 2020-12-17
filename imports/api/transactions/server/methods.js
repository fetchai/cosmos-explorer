import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import {flatten} from 'flat';
import { Transactions } from '../transactions.js';
import { Contracts } from '../contracts.js';
import { Validators } from '../../validators/validators.js';
import { LCD } from '../../../../server/main';


    let totalAddressesTest = []


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

function getContractAddressesFromTX(tx){
  console.log("getContractAddressFromTX")
  const flattened = flatten(tx);

  let nextValueIsAddress = false

  let contractAddresses = [];
    Object.entries(flattened).forEach(([key, value]) => {
	console.log("key, value");
	console.log(key, value);

	if(nextValueIsAddress) {
	  contractAddresses.push(value);
    nextValueIsAddress = false
  }

	if(value === "contract_address") {
nextValueIsAddress = true
  }
});

    console.log("contractAddresses", contractAddresses)
return unique(contractAddresses)
}

function getSenderFromTX(tx){
  console.log("getSenderFromTX")
  const flattened = flatten(tx);

  let nextValueIsAddress = false

  let senderAddress = "";
    Object.entries(flattened).forEach(([key, value]) => {
	console.log("getSenderFromTX key, value");
	console.log(key, value);

	if(nextValueIsAddress) {
	  contractAddresses.push(value);
    nextValueIsAddress = false
  }

	if(value === "sender") {
nextValueIsAddress = true
  }
});

    console.log("contractAddresses", contractAddresses)
return unique(contractAddresses)
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
              console.log("actuallyisContractTransaction")
      // process.exit();
    } else {
                          console.log("not isContractTransaction")
            // process.exit();
    }


    if(isContractTransaction(tx)) {

      const addresses = getContractAddressesFromTX(tx);
      // find contract in contracts table
      console.log("addresses", addresses.toString())


      totalAddressesTest = totalAddressesTest.concat(addresses);
      debugger;
      totalAddressesTest = unique(totalAddressesTest);
      debugger;
      let contract

      for (let i = 0; i < addresses.length; i++)
      {
        contract = Contracts.findOne({ contract_address
      :
        addresses[i]
      })

        const ContractExists = !!contract;

        debugger;

        console.log("ContractExists", ContractExists)

        const count = Contracts.find().count()
debugger;
        console.log("ContractExists count", count)
        console.log("totalAddressesTest", totalAddressesTest.toString())
debugger;
        if (ContractExists) {
          // update
          Contracts.update(
            { contract_address: addresses[i] },
            { $push: { txs: tx } },
          )

        }

      else
        {
        Contracts.insert({
          contract_address: addresses[i],
          starting_height: tx.height,
          txs: [
            tx
          ]
        })
      }



    }
    }


    const count = Contracts.find().count()
        console.log("ContractExists count outside", count)


    // if(count > 1){
    //   process.exit();
    // }

    const txId = Transactions.insert(tx);
    const txCount = Transactions.find({}).count();
    console.log("txId" , txId)
    console.log("txCount", txCount)

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
