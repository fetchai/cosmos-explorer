import { Mongo } from 'meteor/mongo';
import { Blockscon } from '../blocks/blocks.js';

export const Contracts = new Mongo.Collection('contracts');

Contracts.helpers({
  block() {
    return Blockscon.findOne({ height: this.height });
  },
});
