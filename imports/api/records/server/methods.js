import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { ValidatorRecords, Analytics, AverageData, AverageValidatorData } from '../records.js';
import { Validators } from '../../validators/validators.js';
import { ValidatorSets } from '/imports/api/validator-sets/validator-sets.js';
import { Status } from '../../status/status.js';
import { MissedBlocksStats } from '../records.js';
import { MissedBlocks } from '../records.js';
import { Blockscon } from '../../blocks/blocks.js';
import { Chain } from '../../chain/chain.js';
import _ from 'lodash';
const BULKUPDATEMAXSIZE = 1000;

const getBlockStats = (startHeight, latestHeight) => {
    let blockStats = {};
    const cond = {$and: [
        { height: { $gt: startHeight } },
        { height: { $lte: latestHeight } } ]};
    const options = {sort:{height: 1}};
    Blockscon.find(cond, options).forEach((block) => {
        blockStats[block.height] = {
            height: block.height,
            proposerAddress: block.proposerAddress,
            precommitsCount: block.precommitsCount,
            validatorsCount: block.validatorsCount,
            validators: block.validators,
            time: block.time
        }
    });

    Analytics.find(cond, options).forEach((block) => {
        if (!blockStats[block.height]) {
            blockStats[block.height] = { height: block.height };
            console.log(`block ${block.height} does not have an entry`);
        }
        _.assign(blockStats[block.height], {
            precommits: block.precommits,
            averageBlockTime: block.averageBlockTime,
            timeDiff: block.timeDiff,
            voting_power: block.voting_power
        });
    });
    return blockStats;
}

const getPreviousRecord = (voterAddress, proposerAddress) => {
    let previousRecord = MissedBlocks.findOne(
        {voter:voterAddress, proposer:proposerAddress, blockHeight: -1});
    let lastUpdatedHeight = Meteor.settings.params.startHeight;
    let prevStats = {};
    if (previousRecord) {
        prevStats = _.pick(previousRecord, ['missCount', 'totalCount']);
    } else {
        prevStats = {
            missCount: 0,
            totalCount: 0
        }
    }
    return prevStats;
}

Meteor.methods({
  'ValidatorRecords.calculateMissedBlocks': function () {
    this.unblock();
    if (!COUNTMISSEDBLOCKS) {
      try {
        let startTime = Date.now();
        COUNTMISSEDBLOCKS = true;
        console.log('calulate missed blocks count');
        this.unblock();
        let validators = Validators.find({}).fetch();
        let latestHeight = Meteor.call('blocks.getCurrentHeight');
        let explorerStatus = Status.findOne({ chainId: Meteor.settings.public.chainId });
        let startHeight = (explorerStatus && explorerStatus.lastProcessedMissedBlockHeight) ? explorerStatus.lastProcessedMissedBlockHeight : Meteor.settings.params.startHeight;
        latestHeight = Math.min(startHeight + BULKUPDATEMAXSIZE, latestHeight);
        const bulkMissedStats = MissedBlocks.rawCollection().initializeOrderedBulkOp();

        let validatorsMap = {};
        validators.forEach((validator) => validatorsMap[validator.address] = validator);

        // a map of block height to block stats
        let blockStats = getBlockStats(startHeight, latestHeight);

        // proposerVoterStats is a proposer-voter map counting numbers of proposed blocks of which voter is an active validator
        let proposerVoterStats = {}

        _.forEach(blockStats, (block, blockHeight) => {
          let proposerAddress = block.proposerAddress;
          let votedValidators = new Set(block.validators);
          let validatorSets = ValidatorSets.findOne({ block_height: block.height });
          let votedVotingPower = 0;

          validatorSets.validators.forEach((activeValidator) => {
            if (votedValidators.has(activeValidator.address))
              votedVotingPower += parseFloat(activeValidator.voting_power)
          })

          validatorSets.validators.forEach((activeValidator) => {
            let currentValidator = activeValidator.address
            if (!_.has(proposerVoterStats, [proposerAddress, currentValidator])) {
              let prevStats = getPreviousRecord(currentValidator, proposerAddress);
              _.set(proposerVoterStats, [proposerAddress, currentValidator], prevStats);
            }

            }

            if (bulkMissedStats.length > 0){
                bulkMissedStats.execute(Meteor.bindEnvironment((err, result) => {
                    if (err){
                        COUNTMISSEDBLOCKSSTATS = false;
                        console.log(err);
                    }
                    if (result){
                        Status.upsert({chainId: Meteor.settings.public.chainId}, {$set:{lastMissedBlockHeight:latestHeight, lastMissedBlockTime: new Date()}});
                        COUNTMISSEDBLOCKSSTATS = false;
                        console.log("done");
                    }
                }));
            }
            else{
                COUNTMISSEDBLOCKSSTATS = false;
            }

            return true;
        }
        else{
            return "updating...";
        }
    },
    'Analytics.aggregateBlockTimeAndVotingPower': function(time){
        this.unblock();
        let now = new Date();

        if (time == 'm'){
            let averageBlockTime = 0;
            let averageVotingPower = 0;

            let analytics = Analytics.find({ "time": { $gt: new Date(Date.now() - 60 * 1000) } }).fetch();
            if (analytics.length > 0){
                for (i in analytics){
                    averageBlockTime += analytics[i].timeDiff;
                    averageVotingPower += analytics[i].voting_power;
                }
                averageBlockTime = averageBlockTime / analytics.length;
                averageVotingPower = averageVotingPower / analytics.length;

                Chain.update({chainId:Meteor.settings.public.chainId},{$set:{lastMinuteVotingPower:averageVotingPower, lastMinuteBlockTime:averageBlockTime}});
                AverageData.insert({
                    averageBlockTime: averageBlockTime,
                    averageVotingPower: averageVotingPower,
                    type: time,
                    createdAt: now
                })
            }
        }
        if (time == 'h'){
            let averageBlockTime = 0;
            let averageVotingPower = 0;
            let analytics = Analytics.find({ "time": { $gt: new Date(Date.now() - 60*60 * 1000) } }).fetch();
            if (analytics.length > 0){
                for (i in analytics){
                    averageBlockTime += analytics[i].timeDiff;
                    averageVotingPower += analytics[i].voting_power;
                }
                averageBlockTime = averageBlockTime / analytics.length;
                averageVotingPower = averageVotingPower / analytics.length;

                Chain.update({chainId:Meteor.settings.public.chainId},{$set:{lastHourVotingPower:averageVotingPower, lastHourBlockTime:averageBlockTime}});
                AverageData.insert({
                    averageBlockTime: averageBlockTime,
                    averageVotingPower: averageVotingPower,
                    type: time,
                    createdAt: now
                })
            }
        }

        if (time == 'd'){
            let averageBlockTime = 0;
            let averageVotingPower = 0;
            let analytics = Analytics.find({ "time": { $gt: new Date(Date.now() - 24*60*60 * 1000) } }).fetch();
            if (analytics.length > 0){
                for (i in analytics){
                    averageBlockTime += analytics[i].timeDiff;
                    averageVotingPower += analytics[i].voting_power;
                }
                averageBlockTime = averageBlockTime / analytics.length;
                averageVotingPower = averageVotingPower / analytics.length;

                Chain.update({chainId:Meteor.settings.public.chainId},{$set:{lastDayVotingPower:averageVotingPower, lastDayBlockTime:averageBlockTime}});
                AverageData.insert({
                    averageBlockTime: averageBlockTime,
                    averageVotingPower: averageVotingPower,
                    type: time,
                    createdAt: now
                })
            }
        }

        // return analytics.length;
    },
    'Analytics.aggregateValidatorDailyBlockTime': function(){
        this.unblock();
        let validators = Validators.find({}).fetch();
        let now = new Date();
        for (i in validators){
            let averageBlockTime = 0;

            let blocks = Blockscon.find({proposerAddress:validators[i].address, "time": { $gt: new Date(Date.now() - 24*60*60 * 1000) }}, {fields:{height:1}}).fetch();

            if (blocks.length > 0){
                let blockHeights = [];
                for (b in blocks){
                    blockHeights.push(blocks[b].height);
                }

                let analytics = Analytics.find({height: {$in:blockHeights}}, {fields:{height:1,timeDiff:1}}).fetch();


                for (a in analytics){
                    averageBlockTime += analytics[a].timeDiff;
                }

                averageBlockTime = averageBlockTime / analytics.length;
            }

            AverageValidatorData.insert({
                proposerAddress: validators[i].address,
                averageBlockTime: averageBlockTime,
                type: 'ValidatorDailyAverageBlockTime',
                createdAt: now
            })
        }

        return true;
    }
})
