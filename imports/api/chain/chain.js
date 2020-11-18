import { Mongo } from 'meteor/mongo';
import { Validators } from '../validators/validators.js';

export const Chain = new Mongo.Collection('chain');
export const ChainStates = new Mongo.Collection('chain_states');

console.log("DID GET TO STARTING THESE COLLECTIONS")

Chain.helpers({
  proposer() {
    return Validators.findOne({ address: this.proposerAddress });
  },
});
