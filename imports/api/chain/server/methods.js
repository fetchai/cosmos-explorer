import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { getAddress } from 'tendermint/lib/pubkey.js';
import { Chain, ChainStates } from '../chain.js';
import { Validators } from '../../validators/validators.js';
import { VotingPowerHistory } from '../../voting-power/history.js';
import Coin from '../../../../both/utils/coins.js';
import { LCD, RPC } from '../../../../server/main';

const findVotingPower = (validator, genValidators) => {
  for (const v in genValidators) {
    if (validator.pub_key.value === genValidators[v].pub_key.value) {
      return parseInt(genValidators[v].power, 10);
    }
  }
  return 0;
};

Meteor.methods({
  'chain.getConsensusState'() {
    this.unblock();
    const url = `${RPC}/dump_consensus_state`;
    try {
      console.log("dump_consensus_statedump_consensus_statedump_consensus_state")
      const response = HTTP.get(url);
      let consensus = JSON.parse(response.content);
      consensus = consensus.result;
      const { height } = consensus.round_state;
      const { round } = consensus.round_state;
      const { step } = consensus.round_state;
      const votedPower = Math.round(parseFloat(consensus.round_state.votes[round].prevotes_bit_array.split(' ')[3]) * 100);

      Chain.update({ chainId: Meteor.settings.public.chainId }, {
        $set: {
          votingHeight: height,
          votingRound: round,
          votingStep: step,
          votedPower,
          proposerAddress: consensus.round_state.validators.proposer.address,
          prevotes: consensus.round_state.votes[round].prevotes,
          precommits: consensus.round_state.votes[round].precommits,
        },
      });
    } catch (e) {
            console.log("ERROR IN DUNP");
      console.log(e);
    }
  },
  'chain.updateStatus'() {
    this.unblock();
    let url = `${RPC}/status`;
    try {
      let response = HTTP.get(url);
      let status = JSON.parse(response.content);
      status = status.result;
      const chain = {};
      chain.chainId = status.node_info.network;
      chain.latestBlockHeight = status.sync_info.latest_block_height;
      chain.latestBlockTime = status.sync_info.latest_block_time;

      const latestState = ChainStates.findOne({}, { sort: { height: -1 } });
      if (latestState && latestState.height >= chain.latestBlockHeight) {
        return `no updates (getting block ${chain.latestBlockHeight} at block ${latestState.height})`;
      }

      url = `${RPC}/validators`;
      response = HTTP.get(url);
      let validators = JSON.parse(response.content);
      validators = validators.result.validators;
      chain.validators = validators.length;
      let activeVP = 0;
      for (v in validators) {
        activeVP += parseInt(validators[v].voting_power, 10);
      }
      chain.activeVotingPower = activeVP;


      Chain.update({ chainId: chain.chainId }, { $set: chain }, { upsert: true });
      // Get chain states
      if (parseInt(chain.latestBlockHeight, 10) > 0) {
        const chainStates = {};
        chainStates.height = parseInt(status.sync_info.latest_block_height, 10);
        chainStates.time = new Date(status.sync_info.latest_block_time);

        url = `${LCD}/staking/pool`;
        try {
          response = HTTP.get(url);
          const bonding = JSON.parse(response.content).result;
          // chain.bondedTokens = bonding.bonded_tokens;
          // chain.notBondedTokens = bonding.not_bonded_tokens;
          chainStates.bondedTokens = parseInt(bonding.bonded_tokens, 10);
          chainStates.notBondedTokens = parseInt(bonding.not_bonded_tokens, 10);
        } catch (e) {
          console.log(e);
        }

        if (Coin.StakingCoin.denom) {
          url = `${LCD}/supply/total/${Coin.StakingCoin.denom}`;
          try {
            response = HTTP.get(url);
            const supply = JSON.parse(response.content).result;
            chainStates.totalSupply = parseInt(supply, 10);
          } catch (e) {
            console.log(e);
          }

          url = `${LCD}/distribution/community_pool`;
          try {
            response = HTTP.get(url);
            const pool = JSON.parse(response.content).result;
            if (pool && pool.length > 0) {
              chainStates.communityPool = [];
              pool.forEach((amount, i) => {
                chainStates.communityPool.push({
                  denom: amount.denom,
                  amount: parseFloat(amount.amount),
                });
              });
            }
          } catch (e) {
            console.log(e);
          }

          url = `${LCD}/minting/inflation`;
          try {
            response = HTTP.get(url);
            const inflation = JSON.parse(response.content).result;
            if (inflation) {
              chainStates.inflation = parseFloat(inflation);
            }
          } catch (e) {
            console.log(e);
          }

          url = `${LCD}/minting/annual-provisions`;
          try {
            response = HTTP.get(url);
            const provisions = JSON.parse(response.content);
            if (provisions) {
              chainStates.annualProvisions = parseFloat(provisions.result);
            }
          } catch (e) {
            console.log(e);
          }
        }

        ChainStates.insert(chainStates);
      }

      // chain.totalVotingPower = totalVP;

      // validators = Validators.find({}).fetch();
      // console.log(validators);
      return chain.latestBlockHeight;
    } catch (e) {
      console.log(e);
      return 'Error getting chain status.';
    }
  },
  'chain.getLatestStatus'() {
    Chain.find().sort({ created: -1 }).limit(1);
  },
  'chain.genesis'() {
    const chain = Chain.findOne({ chainId: Meteor.settings.public.chainId });

    if (chain && chain.readGenesis) {
      console.log('Genesis file has been processed');
    } else if (Meteor.settings.debug.readGenesis) {
      console.log('=== Start processing genesis file ===');
      const response = HTTP.get(Meteor.settings.genesisFile);
      const genesis = JSON.parse(response.content);
      const distr = genesis.app_state.distr || genesis.app_state.distribution;
      const chainParams = {
        chainId: genesis.chain_id,
        genesisTime: genesis.genesis_time,
        consensusParams: genesis.consensus_params,
        auth: genesis.app_state.auth,
        bank: genesis.app_state.bank,
        staking: {
          pool: genesis.app_state.staking.pool,
          params: genesis.app_state.staking.params,
        },
        mint: genesis.app_state.mint,
        distr: {
          communityTax: distr.community_tax,
          baseProposerReward: distr.base_proposer_reward,
          bonusProposerReward: distr.bonus_proposer_reward,
          withdrawAddrEnabled: distr.withdraw_addr_enabled,
        },
        gov: {
          startingProposalId: 0,
          depositParams: {},
          votingParams: {},
          tallyParams: {},
        },
        slashing: {
          params: genesis.app_state.slashing.params,
        },
        supply: genesis.app_state.supply,
        crisis: genesis.app_state.crisis,
      };

      if (genesis.app_state.gov) {
        chainParams.gov = {
          startingProposalId: genesis.app_state.gov.starting_proposal_id,
          depositParams: genesis.app_state.gov.deposit_params,
          votingParams: genesis.app_state.gov.voting_params,
          tallyParams: genesis.app_state.gov.tally_params,
        };
      }
      let totalVotingPower = 0;

      // read gentx
      if (genesis.app_state.genutil
          && genesis.app_state.genutil.gentxs
          && (genesis.app_state.genutil.gentxs.length > 0)) {
        for (i in genesis.app_state.genutil.gentxs) {
          const { msg } = genesis.app_state.genutil.gentxs[i].value;
          // console.log(msg.type);
          for (m in msg) {
            if (msg[m].type === 'cosmos-sdk/MsgCreateValidator') {
              // let command = Meteor.settings.bin.gaiadebug+" pubkey "+msg[m].value.pubkey;
              const validator = {
                consensus_pubkey: msg[m].value.pubkey,
                description: msg[m].value.description,
                commission: msg[m].value.commission,
                min_self_delegation: msg[m].value.min_self_delegation,
                operator_address: msg[m].value.validator_address,
                delegator_address: msg[m].value.delegator_address,
                voting_power: Math.floor(parseInt(msg[m].value.value.amount, 10) / Coin.StakingCoin.fraction),
                jailed: false,
                status: 2,
              };

              totalVotingPower += validator.voting_power;

              const pubkeyValue = Meteor.call('bech32ToPubkey', msg[m].value.pubkey);
              // Validators.upsert({consensus_pubkey:msg[m].value.pubkey},validator);

              validator.pub_key = {
                type: 'tendermint/PubKeyEd25519',
                value: pubkeyValue,
              };

              validator.address = getAddress(validator.pub_key);
              validator.accpub = Meteor.call('pubkeyToBech32', validator.pub_key, Meteor.settings.public.bech32PrefixAccPub);
              validator.operator_pubkey = Meteor.call('pubkeyToBech32', validator.pub_key, Meteor.settings.public.bech32PrefixValPub);
              VotingPowerHistory.insert({
                address: validator.address,
                prev_voting_power: 0,
                voting_power: validator.voting_power,
                type: 'add',
                height: 0,
                block_time: genesis.genesis_time,
              });

              Validators.insert(validator);
            }
          }
        }
      }

      // read validators from previous chain
      console.log('read validators from previous chain');
      if (genesis.app_state.staking.validators && genesis.app_state.staking.validators.length > 0) {
        console.log(genesis.app_state.staking.validators.length);
        const genValidatorsSet = genesis.app_state.staking.validators;
        const genValidators = genesis.validators;
        for (const v in genValidatorsSet) {
          // console.log(genValidators[v]);
          const validator = genValidatorsSet[v];
          validator.delegator_address = Meteor.call('getDelegator', genValidatorsSet[v].operator_address);

          const pubkeyValue = Meteor.call('bech32ToPubkey', validator.consensus_pubkey);

          validator.pub_key = {
            type: 'tendermint/PubKeyEd25519',
            value: pubkeyValue,
          };

          validator.address = getAddress(validator.pub_key);
          validator.accpub = Meteor.call('pubkeyToBech32', validator.pub_key, Meteor.settings.public.bech32PrefixAccPub);
          validator.operator_pubkey = Meteor.call('pubkeyToBech32', validator.pub_key, Meteor.settings.public.bech32PrefixValPub);

          validator.voting_power = findVotingPower(validator, genValidators);
          totalVotingPower += validator.voting_power;

          Validators.upsert({ consensus_pubkey: validator.consensus_pubkey }, validator);
          VotingPowerHistory.insert({
            address: validator.address,
            prev_voting_power: 0,
            voting_power: validator.voting_power,
            type: 'add',
            height: 0,
            block_time: genesis.genesis_time,
          });
        }
      }

      chainParams.readGenesis = true;
      chainParams.activeVotingPower = totalVotingPower;
      Chain.upsert({ chainId: chainParams.chainId }, { $set: chainParams });

      console.log('=== Finished processing genesis file ===');
    }

    return true;
  },
});
