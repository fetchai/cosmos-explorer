import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Chain, ChainStates } from '../chain.js';
import Coin from '../../../../both/utils/coins.js';

findVotingPower = (validator, genValidators) => {
    for (let v in genValidators) {
        if (validator.pub_key.value == genValidators[v].pub_key.value) {
            return parseInt(genValidators[v].power);
        }
    }
}

Meteor.methods({
    'chain.getConsensusState': function () {
        this.unblock();
        let url = RPC + '/dump_consensus_state';
        try {
            let response = HTTP.get(url);
            let consensus = JSON.parse(response.content);
            consensus = consensus.result;
            let height = consensus.round_state.height;
            let round = consensus.round_state.round;
            let step = consensus.round_state.step;
            let votedPower = Math.round(parseFloat(consensus.round_state.votes[round].prevotes_bit_array.split(" ")[3]) * 100);

            Chain.update({ chainId: Meteor.settings.public.chainId }, {
                $set: {
                    votingHeight: height,
                    votingRound: round,
                    votingStep: step,
                    votedPower: votedPower,
                    proposerAddress: consensus.round_state.validators.proposer.address,
                    prevotes: consensus.round_state.votes[round].prevotes,
                    precommits: consensus.round_state.votes[round].precommits
                }
            });
        }
        catch (e) {
          console.log(url);
          console.log(e);
        }

        if (Coin.StakingCoin.denom) {
          if (Meteor.settings.public.modules.supply) {
            url = LCD + '/supply/total/' + Coin.StakingCoin.denom;
            try {
              response = HTTP.get(url);
              let supply = JSON.parse(response.content).result;
              chainStates.totalSupply = parseInt(supply);
            }
            catch (e) {
              console.log(url);
              console.log(e);
            }
          }

          if (Meteor.settings.public.modules.distribution) {
            url = LCD + '/distribution/community_pool';
            try {
              response = HTTP.get(url);
              let pool = JSON.parse(response.content).result;
              if (pool && pool.length > 0) {
                chainStates.communityPool = [];
                pool.forEach((amount) => {
                  chainStates.communityPool.push({
                    denom: amount.denom,
                    amount: parseFloat(amount.amount)
                  })
                })
              }
            }
            catch (e) {
              console.log(url);
              console.log(e.response.content)
            }
          }

          if (Meteor.settings.public.modules.minting) {
            url = LCD + '/minting/inflation';
            try {
              response = HTTP.get(url);
              let inflation = JSON.parse(response.content).result;
              if (inflation) {
                chainStates.inflation = parseFloat(inflation)
              }
            }
            catch (e) {
              console.log(url);
              console.log(e.response.content);
            }

            url = LCD + '/minting/annual-provisions';
            try {
              response = HTTP.get(url);
              let provisions = JSON.parse(response.content);
              if (provisions) {
                chainStates.annualProvisions = parseFloat(provisions.result)
              }
            }
            catch (e) {
              console.log(url);
              console.log(e.response.content);
            }
          }
        }

        ChainStates.insert(chainStates);
      }

      // chain.totalVotingPower = totalVP;

      // validators = Validators.find({}).fetch();
      // console.log(validators);
      return chain.latestBlockHeight;
    }
    catch (e) {
      console.log(url);
      console.log(e);
      return "Error getting chain status.";
    }
  },
  'chain.getLatestStatus': function () {
    this.unblock();
    Chain.find().sort({ created: -1 }).limit(1);
  },
})
