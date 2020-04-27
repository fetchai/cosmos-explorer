import { Meteor } from 'meteor/meteor';
import { ValidatorSets } from '../validator-sets.js';

Meteor.publish('validatorSets.all', function () {
  return ValidatorSets.find();
});
