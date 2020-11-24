import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Promise } from 'meteor/promise';
import { Blockscon } from '/imports/api/blocks/blocks.js';
import { Chain } from '/imports/api/chain/chain.js';
import { ValidatorSets } from '/imports/api/validator-sets/validator-sets.js';
import { Validators } from '/imports/api/validators/validators.js';
import { Analytics, ValidatorRecords, VPDistributions } from '/imports/api/records/records.js';
import { VotingPowerHistory } from '/imports/api/voting-power/history.js';
import { sha256 } from 'js-sha256';
import { getAddress } from 'tendermint/lib/pubkey';
import * as cheerio from 'cheerio';
import { Evidences } from '../../evidences/evidences.js';
import { Transactions } from '../../transactions/transactions.js';
import { LCD, RPC } from '../../../../server/main';
import React from "react";
import BN from 'bn.js'

let SYNCING = false;

function hasTransactionIds(block){
    return Boolean(block.block.data.txs && block.block.data.txs.length > 0)
}

const getRemovedValidators = (prevValidators, validators) => {
  // let removeValidators = [];
  for (p in prevValidators) {
    for (v in validators) {
      if (prevValidators[p].address === validators[v].address) {
        prevValidators.splice(p, 1);
      }
    }
  }

  return prevValidators;
};

const getValidatorProfileUrl = (identity) => {
  if (identity.length === 16) {
    const response = HTTP.get(`https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${identity}&fields=pictures`);
    if (response.statusCode === 200) {
      const { them } = response.data;
      return them && them.length && them[0].pictures && them[0].pictures.primary && them[0].pictures.primary.url;
    }
    console.log(JSON.stringify(response));
  } else if (identity.indexOf('keybase.io/team/') > 0) {
    const teamPage = HTTP.get(identity);
    if (teamPage.statusCode === 200) {
      const page = cheerio.load(teamPage.content);
      return page('.kb-main-card img').attr('src');
    }
    console.log(JSON.stringify(teamPage));
  }
};

// var filtered = [1, 2, 3, 4, 5].filter(notContainedIn([1, 2, 3, 5]));
// console.log(filtered); // [4]

Meteor.methods({
  'blocks.averageBlockTime'(address) {
    const blocks = Blockscon.find({ proposerAddress: address }).fetch();
    const heights = blocks.map((block) => block.height);
    const blocksStats = Analytics.find({ height: { $in: heights } }).fetch();
    // console.log(blocksStats);

    let totalBlockDiff = 0;
    for (b in blocksStats) {
      totalBlockDiff += blocksStats[b].timeDiff;
    }
    return totalBlockDiff / heights.length;
  },
  'blocks.findUpTime'(address) {
    const collection = ValidatorRecords.rawCollection();
    // let aggregateQuery = Meteor.wrapAsync(collection.aggregate, collection);
    const pipeline = [
      { $match: { address } },
      // {$project:{address:1,height:1,exists:1}},
      { $sort: { height: -1 } },
      { $limit: (Meteor.settings.public.uptimeWindow - 1) },
      { $unwind: '$_id' },
      {
        $group: {
          _id: '$address',
          uptime: {
            $sum: {
              $cond: [{ $eq: ['$exists', true] }, 1, 0],
            },
          },
        },
      }];
    // let result = aggregateQuery(pipeline, { cursor: {} });

    return Promise.await(collection.aggregate(pipeline).toArray());
    // return .aggregate()
  },
  'blocks.getLatestHeight'() {
    this.unblock();
    const url = `${RPC}/status`;
    try {
      const response = HTTP.get(url);
      const status = JSON.parse(response.content);
      return (status.result.sync_info.latest_block_height);
    } catch (e) {
      return 0;
    }
  },
  'blocks.getCurrentHeight'() {
    this.unblock();
    const currHeight = Blockscon.find({}, { sort: { height: -1 }, limit: 1 }).fetch();
    // console.log("currentHeight:"+currHeight);
    const { startHeight } = Meteor.settings.params;
    if (currHeight && currHeight.length == 1) {
      const { height } = currHeight[0];
      if (height > startHeight) { return height; }
    }
    return startHeight;
  },
  'blocks.blocksUpdate'() {
    if (SYNCING) { return 'Syncing...'; }
    console.log('start to sync');
    // Meteor.clearInterval(Meteor.timerHandle);
    // get the latest height
    const until = Meteor.call('blocks.getLatestHeight');
    // console.log(until);
    // get the current height in db
    const curr = Meteor.call('blocks.getCurrentHeight');
    console.log(curr);
    // loop if there's update in db
    if (until > curr) {
      SYNCING = true;

      const validatorSet = {};
      // get latest validator candidate information
      let url = `${LCD}/staking/validators`;

      try {
        const response = HTTP.get(url);
        JSON.parse(response.content).result.forEach(
          (validator) => validatorSet[validator.consensus_pubkey] = validator,
        );
      } catch (e) {
        console.log(e);
      }
      url = `${LCD}/staking/validators?status=unbonding`;

      try {
        const response = HTTP.get(url);
        JSON.parse(response.content).result.forEach(
          (validator) => validatorSet[validator.consensus_pubkey] = validator,
        );
      } catch (e) {
        console.log( "taking/validators?status=" , e);
      }

      url = `${LCD}/staking/validators?status=unbonded`;

      try {
        const response = HTTP.get(url);
        JSON.parse(response.content).result.forEach(
          (validator) => validatorSet[validator.consensus_pubkey] = validator,
        );
      } catch (e) {
        console.log(e);
      }
      const totalValidators = Object.keys(validatorSet).length;
      console.log(`all validators: ${totalValidators}`);
      for (let height = curr + 1; height <= until; height++) {
        const startBlockTime = new Date();
        // add timeout here? and outside this loop (for catched up and keep fetching)?
        this.unblock();
        url = `${RPC}/block?height=${height}`;
        const analyticsData = {};

        try {
          const bulkValidators = Validators.rawCollection().initializeUnorderedBulkOp();
          const bulkValidatorRecords = ValidatorRecords.rawCollection().initializeUnorderedBulkOp();
          const bulkVPHistory = VotingPowerHistory.rawCollection().initializeUnorderedBulkOp();
          const bulkTransations = Transactions.rawCollection().initializeUnorderedBulkOp();

          const startGetHeightTime = new Date();
          let response = HTTP.get(url);
          if (response.statusCode === 200) {
            let block = JSON.parse(response.content);
            block = block.result;
            // store height, hash, numtransaction and time in db
            const blockData = {};
            blockData.height = height;
            blockData.hash = block.block_id.hash;
            blockData.transNum = block.block.data.txs ? block.block.data.txs.length : 0;
            blockData.time = new Date(block.block.header.time);
            blockData.lastBlockHash = block.block.header.last_block_id.hash;
            blockData.proposerAddress = block.block.header.proposer_address;
            blockData.validators = [];
           if(Meteor.settings.public.DKGTab) {
                blockData.dkg = {};
                blockData.dkg.round = block.block.header.entropy.round
                blockData.dkg.startBlock = block.block.header.entropy.dkg_id
                blockData.dkg.groupSignature = block.block.header.entropy.group_signature
                blockData.dkg.endBlock =  new BN(block.block.header.entropy.dkg_id).add(new BN(block.block.header.entropy.aeon_length)).toString()
                blockData.dkg.txIds = hasTransactionIds(block)? block.block.data.txs : [];
            }

            const precommits = block.block.last_commit.signatures;
            if (precommits != null) {
              // console.log(precommits.length);
              for (let i = 0; i < precommits.length; i++) {
                if (precommits[i] != null) {
                  blockData.validators.push(precommits[i].validator_address);
                }
              }

              analyticsData.precommits = precommits.length;
              // record for analytics
              // PrecommitRecords.insert({height:height, precommits:precommits.length});
            }

            // save txs in database
            if (block.block.data.txs && block.block.data.txs.length > 0) {
              for (t in block.block.data.txs) {
                Meteor.call('Transactions.index', sha256(Buffer.from(block.block.data.txs[t], 'base64')), blockData.time, (err, result) => {
                  if (err) {
                    console.log(err);
                  }
                });
              }
            }

            // save double sign evidences
            if (block.block.evidence.evidence) {
              Evidences.insert({
                height,
                evidence: block.block.evidence.evidence,
              });
            }
            blockData.precommitsCount = blockData.validators.length;

            analyticsData.height = height;

            const endGetHeightTime = new Date();
            console.log(`Get height time: ${(endGetHeightTime - startGetHeightTime) / 1000}seconds.`);


            const startGetValidatorsTime = new Date();
            // update chain status
            url = `${RPC}/validators?height=${height}`;
            response = HTTP.get(url);
            console.log(url);
            const validators = JSON.parse(response.content);
            validators.result.block_height = parseInt(validators.result.block_height);
            ValidatorSets.insert(validators.result);

            blockData.validatorsCount = validators.result.validators.length;
            const startBlockInsertTime = new Date();
            Blockscon.insert(blockData);
            const endBlockInsertTime = new Date();
            console.log(`Block insert time: ${(endBlockInsertTime - startBlockInsertTime) / 1000}seconds.`);

            // store valdiators exist records
            const existingValidators = Validators.find({ address: { $exists: true } }).fetch();

            if (height > 1) {
              // record precommits and calculate uptime
              // only record from block 2
              for (i in validators.result.validators) {
                const { address } = validators.result.validators[i];
                const record = {
                  height,
                  address,
                  exists: false,
                  voting_power: parseInt(validators.result.validators[i].voting_power), // getValidatorVotingPower(existingValidators, address)
                };
                if (precommits != null) {
                  for (j in precommits) {
                    if (precommits[j] != null) {
                      if (address === precommits[j].validator_address) {
                        record.exists = true;
                        precommits.splice(j, 1);
                        break;
                      }
                    }
                  }
                }

                // calculate the uptime based on the records stored in previous blocks
                // only do this every 15 blocks ~

                if ((height % 15) === 0) {
                  // let startAggTime = new Date();
                  const numBlocks = Meteor.call('blocks.findUpTime', address);
                  let uptime = 0;
                  // let endAggTime = new Date();
                  // console.log("Get aggregated uptime for "+existingValidators[i].address+": "+((endAggTime-startAggTime)/1000)+"seconds.");
                  console.log(`uptime: ${JSON.stringify(numBlocks[0])} ${numBlocks.length}}`);
                  if ((numBlocks[0] != null) && (numBlocks[0].uptime != null)) {
                    uptime = numBlocks[0].uptime;
                  }

                  let base = Meteor.settings.public.uptimeWindow;
                  if (height < base) {
                    base = height;
                  }

                  if (record.exists) {
                    if (uptime < base) {
                      uptime++;
                    }
                    uptime = (uptime / base) * 100;
                    bulkValidators.find({ address }).upsert().updateOne({ $set: { uptime, lastSeen: blockData.time } });
                  } else {
                    uptime = (uptime / base) * 100;
                    bulkValidators.find({ address }).upsert().updateOne({ $set: { uptime } });
                  }
                }

                bulkValidatorRecords.insert(record);
                // ValidatorRecords.update({height:height,address:record.address},record);
              }
            }

            const chainStatus = Chain.findOne({ chainId: block.block.header.chain_id });
            const lastSyncedTime = chainStatus ? chainStatus.lastSyncedTime : 0;
            let timeDiff;
            let blockTime = Meteor.settings.params.defaultBlockTime;
            if (lastSyncedTime) {
              const dateLatest = blockData.time;
              const dateLast = new Date(lastSyncedTime);
              timeDiff = Math.abs(dateLatest.getTime() - dateLast.getTime());
              blockTime = (chainStatus.blockTime * (blockData.height - 1) + timeDiff) / blockData.height;
            }

            const endGetValidatorsTime = new Date();
            console.log(`Get height validators time: ${(endGetValidatorsTime - startGetValidatorsTime) / 1000}seconds.`);

            Chain.update({ chainId: block.block.header.chain_id }, { $set: { lastSyncedTime: blockData.time, blockTime } });

            analyticsData.averageBlockTime = blockTime;
            analyticsData.timeDiff = timeDiff;

            analyticsData.time = blockData.time;

            // initialize validator data at first block
            // if (height == 1){
            //     Validators.remove({});
            // }

            analyticsData.voting_power = 0;

            const startFindValidatorsNameTime = new Date();
            if (validators.result) {
              // validators are all the validators in the current height
              console.log(`validatorSet size: ${validators.result.validators.length}`);
              for (v in validators.result.validators) {
                // Validators.insert(validators.result.validators[v]);
                const validator = validators.result.validators[v];
                validator.voting_power = parseInt(validator.voting_power, 10);
                validator.proposer_priority = parseInt(validator.proposer_priority, 10);

                const valExist = Validators.findOne({ 'pub_key.value': validator.pub_key.value });
                if (!valExist) {
                  console.log(`validator pub_key ${validator.address} ${validator.pub_key.value} not in db`);
                  // let command = Meteor.settings.bin.gaiadebug+" pubkey "+validator.pub_key.value;
                  // console.log(command);
                  // let tempVal = validator;

                  validator.address = getAddress(validator.pub_key);
                  validator.accpub = Meteor.call('pubkeyToBech32', validator.pub_key, Meteor.settings.public.bech32PrefixAccPub);
                  validator.operator_pubkey = Meteor.call('pubkeyToBech32', validator.pub_key, Meteor.settings.public.bech32PrefixValPub);
                  validator.consensus_pubkey = Meteor.call('pubkeyToBech32', validator.pub_key, Meteor.settings.public.bech32PrefixConsPub);

                  const validatorData = validatorSet[validator.consensus_pubkey];
                  if (validatorData) {
                    if (validatorData.description.identity) { validator.profile_url = getValidatorProfileUrl(validatorData.description.identity); }
                    validator.operator_address = validatorData.operator_address;
                    validator.delegator_address = Meteor.call('getDelegator', validatorData.operator_address);
                    validator.jailed = validatorData.jailed;
                    validator.status = validatorData.status;
                    validator.min_self_delegation = validatorData.min_self_delegation;
                    validator.tokens = validatorData.tokens;
                    validator.delegator_shares = validatorData.delegator_shares;
                    validator.description = validatorData.description;
                    validator.bond_height = validatorData.bond_height;
                    validator.bond_intra_tx_counter = validatorData.bond_intra_tx_counter;
                    validator.unbonding_height = validatorData.unbonding_height;
                    validator.unbonding_time = validatorData.unbonding_time;
                    validator.commission = validatorData.commission;
                    validator.self_delegation = validator.delegator_shares;
                    // validator.removed = false,
                    // validator.removedAt = 0
                    // validatorSet.splice(val, 1);
                  } else {
                    console.log('no con pub key?');
                  }

                  // bulkValidators.insert(validator);
                  bulkValidators.find({ address: validator.address }).upsert().updateOne({ $set: validator });
                  // console.log("validator first appears: "+bulkValidators.length);
                  bulkVPHistory.insert({
                    address: validator.address,
                    prev_voting_power: 0,
                    voting_power: validator.voting_power,
                    type: 'add',
                    height: blockData.height,
                    block_time: blockData.time,
                  });
                } else {
                  const validatorData = validatorSet[valExist.consensus_pubkey];
                  if (validatorData) {
                    if (validatorData.description
                        && (!valExist.description
                            || validatorData.description.identity !== valExist.description.identity)) {
                      validator.profile_url = getValidatorProfileUrl(validatorData.description.identity);
                    }
                    validator.jailed = validatorData.jailed;
                    validator.status = validatorData.status;
                    validator.tokens = validatorData.tokens;
                    validator.delegator_shares = validatorData.delegator_shares;
                    validator.description = validatorData.description;
                    validator.bond_height = validatorData.bond_height;
                    validator.bond_intra_tx_counter = validatorData.bond_intra_tx_counter;
                    validator.unbonding_height = validatorData.unbonding_height;
                    validator.unbonding_time = validatorData.unbonding_time;
                    validator.commission = validatorData.commission;
                    validator.operator_address = validatorData.operator_address;
                    // calculate self delegation percentage every 30 blocks
                    validator.delegator_address = Meteor.call('getDelegator', validatorData.operator_address);

                    if (height % 30 === 1) {
                      try {
                        const response = HTTP.get(`${LCD}/staking/delegators/${validator.delegator_address}/delegations/${validator.operator_address}`);

                        if (response.statusCode === 200) {
                          const selfDelegation = JSON.parse(response.content).result;
                          if (selfDelegation.shares) {
                            validator.self_delegation = parseFloat(selfDelegation.shares) / parseFloat(validator.delegator_shares);
                          }
                        }
                      } catch (e) {
                        // console.log(e);
                      }
                    }

                    bulkValidators.find({ consensus_pubkey: valExist.consensus_pubkey }).updateOne({ $set: validator });
                    // console.log("validator exisits: "+bulkValidators.length);
                    // validatorSet.splice(val, 1);
                  } else {
                    console.log('no con pub key?');
                  }
                  const prevVotingPower = VotingPowerHistory.findOne({ address: validator.address }, { height: -1, limit: 1 });

                  if (prevVotingPower) {
                    if (prevVotingPower.voting_power !== validator.voting_power) {
                      const changeType = (prevVotingPower.voting_power > validator.voting_power) ? 'down' : 'up';
                      const changeData = {
                        address: validator.address,
                        prev_voting_power: prevVotingPower.voting_power,
                        voting_power: validator.voting_power,
                        type: changeType,
                        height: blockData.height,
                        block_time: blockData.time,
                      };
                      bulkVPHistory.insert(changeData);
                    }
                  }
                }

                analyticsData.voting_power += validator.voting_power;
              }

              // if there is validator removed

              const prevValidators = ValidatorSets.findOne({ block_height: height - 1 });

              if (prevValidators) {
                const removedValidators = getRemovedValidators(prevValidators.validators, validators.result.validators);

                for (r in removedValidators) {
                  bulkVPHistory.insert({
                    address: removedValidators[r].address,
                    prev_voting_power: removedValidators[r].voting_power,
                    voting_power: 0,
                    type: 'remove',
                    height: blockData.height,
                    block_time: blockData.time,
                  });
                }
              }
            }
            // check if there's any validator not in db 14400 blocks(~1 day)
            if (height % 14400 === 0) {
              try {
                console.log('Checking all validators against db...');
                const dbValidators = {};
                Validators.find({}, { fields: { consensus_pubkey: 1, status: 1 } }).forEach((v) => dbValidators[v.consensus_pubkey] = v.status);
                Object.keys(validatorSet).forEach((conPubKey) => {
                  const validatorData = validatorSet[conPubKey];
                  // Active validators should have been updated in previous steps
                  if (validatorData.status === 2) { return; }

                  if (dbValidators[conPubKey] == undefined) {
                    console.log(`validator with consensus_pubkey ${conPubKey} not in db`);

                    validatorData.pub_key = {
                      type: 'tendermint/PubKeyEd25519',
                      value: Meteor.call('bech32ToPubkey', conPubKey),
                    };
                    validatorData.address = getAddress(validatorData.pub_key);

                    validatorData.accpub = Meteor.call('pubkeyToBech32', validatorData.pub_key, Meteor.settings.public.bech32PrefixAccPub);
                    validatorData.operator_pubkey = Meteor.call('pubkeyToBech32', validatorData.pub_key, Meteor.settings.public.bech32PrefixValPub);

                    console.log(JSON.stringify(validatorData));
                    bulkValidators.find({ consensus_pubkey: conPubKey }).upsert().updateOne({ $set: validatorData });
                  } else if (dbValidators[conPubKey] === 2) {
                    bulkValidators.find({ consensus_pubkey: conPubKey }).upsert().updateOne({ $set: validatorData });
                  }
                });
              } catch (e) {
                console.log(e);
              }
            }

            // fetching keybase every 14400 blocks(~1 day)
            if (height % 14400 === 1) {
              console.log('Fetching keybase...');
              Validators.find({}).forEach((validator) => {
                try {
                  const profileUrl = getValidatorProfileUrl(validator.description.identity);
                  if (profileUrl) {
                    bulkValidators.find({ address: validator.address }).upsert().updateOne({ $set: { profile_url: profileUrl } });
                  }
                } catch (e) {
                  console.log(e);
                }
              });
            }

            const endFindValidatorsNameTime = new Date();
            console.log(`Get validators name time: ${(endFindValidatorsNameTime - startFindValidatorsNameTime) / 1000}seconds.`);

            // record for analytics
            const startAnayticsInsertTime = new Date();
            Analytics.insert(analyticsData);
            const endAnalyticsInsertTime = new Date();
            console.log(`Analytics insert time: ${(endAnalyticsInsertTime - startAnayticsInsertTime) / 1000}seconds.`);

            const startVUpTime = new Date();
            if (bulkValidators.length > 0) {
              // console.log(bulkValidators.length);
              bulkValidators.execute((err, result) => {
                if (err) {
                  console.log(err);
                }
                if (result) {
                  // console.log(result);
                }
              });
            }

            const endVUpTime = new Date();
            console.log(`Validator update time: ${(endVUpTime - startVUpTime) / 1000}seconds.`);

            const startVRTime = new Date();
            if (bulkValidatorRecords.length > 0) {
              bulkValidatorRecords.execute((err, result) => {
                if (err) {
                  console.log(err);
                }
              });
            }

            const endVRTime = new Date();
            console.log(`Validator records update time: ${(endVRTime - startVRTime) / 1000}seconds.`);

            if (bulkVPHistory.length > 0) {
              bulkVPHistory.execute((err, result) => {
                if (err) {
                  console.log(err);
                }
              });
            }

            if (bulkTransations.length > 0) {
              bulkTransations.execute((err, result) => {
                if (err) {
                  console.log(err);
                }
              });
            }

            // calculate voting power distribution every 60 blocks ~ 5mins

            if (height % 5 === 0) {
              console.log('===== calculate voting power distribution =====');
              const activeValidators = Validators.find({ status: 2, jailed: false }, { sort: { voting_power: -1 } }).fetch();
              const numTopTwenty = Math.ceil(activeValidators.length * 0.2);
              const numBottomEighty = activeValidators.length - numTopTwenty;

              let topTwentyPower = 0;
              let bottomEightyPower = 0;

              let numTopThirtyFour = 0;
              let numBottomSixtySix = 0;
              let topThirtyFourPercent = 0;
              let bottomSixtySixPercent = 0;


              for (v in activeValidators) {
                if (v < numTopTwenty) {
                  topTwentyPower += activeValidators[v].voting_power;
                } else {
                  bottomEightyPower += activeValidators[v].voting_power;
                }


                if (topThirtyFourPercent < 0.34) {
                  topThirtyFourPercent += activeValidators[v].voting_power / analyticsData.voting_power;
                  numTopThirtyFour++;
                }
              }

              bottomSixtySixPercent = 1 - topThirtyFourPercent;
              numBottomSixtySix = activeValidators.length - numTopThirtyFour;

              const vpDist = {
                height,
                numTopTwenty,
                topTwentyPower,
                numBottomEighty,
                bottomEightyPower,
                numTopThirtyFour,
                topThirtyFourPercent,
                numBottomSixtySix,
                bottomSixtySixPercent,
                numValidators: activeValidators.length,
                totalVotingPower: analyticsData.voting_power,
                blockTime: blockData.time,
                createAt: new Date(),
              };

              console.log(vpDist);

              VPDistributions.insert(vpDist);
            }
          }
        } catch (e) {
          console.log(e);
          SYNCING = false;
          return 'Stopped';
        }
        const endBlockTime = new Date();
        console.log(`This block used: ${(endBlockTime - startBlockTime) / 1000}seconds.`);
      }
      SYNCING = false;
      console.log("did get to here test test test", totalValidators)
      Chain.update({ chainId: Meteor.settings.public.chainId }, { $set: { lastBlocksSyncedTime: new Date(), totalValidators } });
    }

    return until;
  },
  addLimit(limit) {
    // console.log(limit+10)
    return (limit + 10);
  },
  hasMore(limit) {
    if (limit > Meteor.call('getCurrentHeight')) {
      return false;
    }
    return true;
  },
});
