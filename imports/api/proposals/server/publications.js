import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Proposals } from '../proposals.js';

Meteor.publish('proposals.list', function () {
  return Proposals.find({}, { sort: { proposalId: -1 } });
});

Meteor.publish('proposals.one', function (id) {
  check(id, Number);
  return Proposals.find({ proposalId: id });
});
