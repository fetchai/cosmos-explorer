import { publishComposite } from 'meteor/reywood:publish-composite';
import { Blockscon } from '../blocks.js';
import { Validators } from '../../validators/validators.js';
import { Transactions } from '../../transactions/transactions.js';

publishComposite('blocks.height', function(limit) {
  return {
    find() {
      return Blockscon.find({}, { limit, sort: { height: -1 } });
    },
    children: [
      {
        find(block) {
          return Validators.find(
            { address: block.proposerAddress },
            { limit: 1 },
          );
        },
      },
    ],
  };
});

publishComposite('blocks.findOne', function(height) {
  return {
    find() {
      return Blockscon.find({ height });
    },
    children: [
      {
        find(block) {
          return Transactions.find(
            { height: block.height },
          );
        },
      },
      {
        find(block) {
          return Validators.find(
            { address: block.proposerAddress },
            { limit: 1 },
          );
        },
      },
    ],
  };
});
