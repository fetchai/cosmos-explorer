import { Meteor } from 'meteor/meteor';
import { publishComposite } from 'meteor/reywood:publish-composite';
import { Chain, ChainStates } from '../chain.js';
import { CoinStats } from '../../coin-stats/coin-stats.js';
import { Validators } from '../../validators/validators.js';


Meteor.publish('chainStates.latest', function () {
  return [
    ChainStates.find({}, { sort: { height: -1 }, limit: 1 }),
    CoinStats.find({}, { sort: { last_updated_at: -1 }, limit: 1 }),
  ];
});

publishComposite('chain.status', function() {

  console.log("chain.status Meteor.settings.public.chainId")
  debugger;

//   Chain.find().toArray(function (err, docs) {
//     console.log("chain trinted" , docs)
// });

  return {
    find() {
      return Chain.find({ chainId: Meteor.settings.public.chainId });
    },
    children: [
      {
        find(chain) {
          return Validators.find(
            {},
            {
              fields: {
                address: 1,
                description: 1,
                operator_address: 1,
                status: -1,
                jailed: 1,
                profile_url: 1,
              },
            },
          );
        },
      },
    ],
  };
});
