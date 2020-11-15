/* eslint-disable no-console */
// Server entry point, imports all server code
import { Meteor } from 'meteor/meteor';
import '/imports/startup/server';
import '/imports/startup/both';
// import moment from 'moment';
// import '/imports/api/blocks/blocks.js';

export let COUNTMISSEDBLOCKS = false;
export let COUNTMISSEDBLOCKSSTATS = false;
export const RPC = Meteor.settings.remote.rpc;
export const LCD = Meteor.settings.remote.lcd;

const updateChainStatus = () => {
  Meteor.call('chain.updateStatus', (error, result) => {
    if (error) {
      console.log(`updateStatus: ${error}`);
    } else {
      console.log(`updateStatus: ${result}`);
    }
  });
};

const updateBlock = () => {
  Meteor.call('blocks.blocksUpdate', (error, result) => {
    if (error) {
      console.log(`updateBlocks: ${error}`);
    } else {
      console.log(`updateBlocks: ${result}`);
    }
  });
};

const getConsensusState = () => {
  Meteor.call('chain.getConsensusState', (error, _) => {
    if (error) {
      console.log(`get consensus: ${error}`);
    }
  });
};

const getProposals = () => {
  Meteor.call('proposals.getProposals', (error, result) => {
    if (error) {
      console.log(`get proposal: ${error}`);
    }
    if (result) {
      console.log(`get proposal: ${result}`);
    }
  });
};

const getProposalsResults = () => {
  Meteor.call('proposals.getProposalResults', (error, result) => {
    if (error) {
      console.log(`get proposals result: ${error}`);
    }
    if (result) {
      console.log(`get proposals result: ${result}`);
    }
  });
};

const updateMissedBlocks = () => {
  Meteor.call('ValidatorRecords.calculateMissedBlocks', (error, result) => {
    if (error) {
      debugger;
      console.log(`missed blocks error: ${error}`);
    }
    if (result) {
      console.log(`missed blocks ok:${result}`);
    }
  });
/*
    Meteor.call('ValidatorRecords.calculateMissedBlocksStats', (error, result) =>{
        if (error){
            console.log("missed blocks stats error: "+ error)
        }
        if (result){
            console.log("missed blocks stats ok:" + result);
        }
    });
*/
};

const getDelegations = () => {
  Meteor.call('delegations.getDelegations', (error, result) => {
    if (error) {
      console.log(`get delegations error: ${error}`);
    } else {
      console.log(`get delegations ok: ${result}`);
    }
  });
};

const aggregateMinutely = () => {
  // doing something every min
  Meteor.call('Analytics.aggregateBlockTimeAndVotingPower', 'm', (error, result) => {
    if (error) {
      console.log(`aggregate minutely block time error: ${error}`);
    } else {
      debugger;
      console.log(`aggregate minutely block time ok: ${result}`);
    }
  });

  Meteor.call('coinStats.getCoinStats', (error, result) => {
    if (error) {
      console.log(`get coin stats error: ${error}`);
    } else {
      console.log(`get coin stats ok: ${result}`);
    }
  });
};

const aggregateHourly = () => {
  // doing something every hour
  Meteor.call('Analytics.aggregateBlockTimeAndVotingPower', 'h', (error, result) => {
    if (error) {
      console.log(`aggregate hourly block time error: ${error}`);
    } else {
      console.log(`aggregate hourly block time ok: ${result}`);
    }
  });
};

const aggregateDaily = () => {
  // doing somthing every day
  Meteor.call('Analytics.aggregateBlockTimeAndVotingPower', 'd', (error, result) => {
    if (error) {
      console.log(`aggregate daily block time error: ${error}`);
    } else {
      console.log(`aggregate daily block time ok: ${result}`);
    }
  });

  Meteor.call('Analytics.aggregateValidatorDailyBlockTime', (error, result) => {
    if (error) {
      console.log(`aggregate validators block time error:${error}`);
    } else {
      console.log(`aggregate validators block time ok:${result}`);
    }
  });
};


Meteor.startup(function() {
  if (Meteor.isDevelopment) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    import DEFAULTSETTINGSJSON from '../default_settings.json';

    Object.keys(DEFAULTSETTINGSJSON).forEach((key) => {
      if (Meteor.settings[key] === undefined) {
        console.warn(`CHECK SETTINGS JSON: ${key} is missing from settings`);
        Meteor.settings[key] = {};
      }
      Object.keys(DEFAULTSETTINGSJSON[key]).forEach((param) => {
        if (Meteor.settings[key][param] === undefined) {
          console.warn(`CHECK SETTINGS JSON: ${key}.${param} is missing from settings`);
          Meteor.settings[key][param] = DEFAULTSETTINGSJSON[key][param];
        }
      });
    });
  }
  Meteor.call('chain.genesis', (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      if (Meteor.settings.debug.startTimer) {
        Meteor.setInterval(function() {
          getConsensusState();
        }, Meteor.settings.params.consensusInterval);

        Meteor.setInterval(function() {
          updateBlock();
        }, Meteor.settings.params.blockInterval);

        Meteor.setInterval(function() {
          updateChainStatus();
        }, Meteor.settings.params.statusInterval);

        if (Meteor.settings.params.proposalInterval >= 0) {
          Meteor.setInterval(function () {
            getProposals();
          }, Meteor.settings.params.proposalInterval);

          Meteor.setInterval(function () {
            getProposalsResults();
          }, Meteor.settings.params.proposalInterval);
        }

        Meteor.setInterval(function() {
          updateMissedBlocks();
        }, Meteor.settings.params.missedBlocksInterval);

        Meteor.setInterval(function() {
          getDelegations();
        }, Meteor.settings.params.delegationInterval);

        Meteor.setInterval(function() {
          const now = new Date();
          if ((now.getUTCSeconds() === 0)) {
            aggregateMinutely();
          }

          if ((now.getUTCMinutes() === 0) && (now.getUTCSeconds() === 0)) {
            aggregateHourly();
          }

          if ((now.getUTCHours() === 0) && (now.getUTCMinutes() === 0) && (now.getUTCSeconds() === 0)) {
            aggregateDaily();
          }
        }, 1000);
      }
    }
  });
});
