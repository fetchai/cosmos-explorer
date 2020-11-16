const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()
const port = 4000;

const dumpConsensusState = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/dump-consensus-state");
const status = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/status");
const proposals = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/proposals");
const validators = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/validators/validators");
const stakingPool = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/staking-pool");
const supply = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/supply");
const communityPool = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/community-pool");
const inflation = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/inflation");
const stakingValidators = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/staking-validators");
const annualProvisions = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/annual-provisions");
const bondedValidators = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/validators/bonded-validators");
const unbondedValidators = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/validators/unbonding-validators");



const testAddress = "fetch193vvag846gz3pt3q0mdjuxn0s5jrt39fsjrays"
// account files relate to this single address
const bankBalances = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/account/bank-balances");
const authAccount = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/account/auth-account");
const stakingDelegators = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/account/staking-delegators");
const distributionDelegators = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/account/distribution-delegators");
const distributionDelegatorsUnbonding = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/account/staking-delegator-unbonding-delegations");


function loadJSON(file) {
    var data = fs.readFileSync(file);
    return JSON.parse(data);
}



app.use(express.static(path.join(__dirname, './public')));

app.get('/rpc/dump_consensus_state', (req, res) => {
  console.log("dump_consensus_state22222", JSON.stringify(req.originalUrl))
    res.end(JSON.stringify(dumpConsensusState))
})

app.get('/rpc/status', (req, res) => {
  console.log(" /rpc/status", JSON.stringify(req.originalUrl))
  res.end(JSON.stringify(status))
})

app.get(`/lcd/bank/balances/${testAddress}`, (req, res) => {
  console.log("lcd/bank/balances", JSON.stringify(req.originalUrl))
    res.end(JSON.stringify(bankBalances))
})

app.get(`/lcd/auth/accounts/${testAddress}`, (req, res) => {
  console.log("lcd/auth/accounts", JSON.stringify(req.originalUrl))
    res.end(JSON.stringify(authAccount))
})

app.get(`/lcd/staking/delegators/${testAddress}/delegations`, (req, res) => {
  console.log("lcdstaking/delegators", JSON.stringify(req.originalUrl))
    res.end(JSON.stringify(stakingDelegators))
})

app.get(`/lcd/distribution/delegators/${testAddress}/rewards`, (req, res) => {
  console.log("lcd distribution/delegators", JSON.stringify(req.originalUrl))
    res.end(JSON.stringify(distributionDelegators))
})

app.get(`/lcd/staking/delegators/${testAddress}/unbonding_delegations`, (req, res) => {
  console.log("lcd delegators/delegators", JSON.stringify(req.originalUrl))
    res.end(JSON.stringify(distributionDelegatorsUnbonding))
})

app.get('/lcd/gov/proposals', (req, res) => {
  console.log("/lcd/gov/proposals", JSON.stringify(req.originalUrl))
    res.end(JSON.stringify(proposals))
})

app.get('/lcd/staking/pool', (req, res) => {
  console.log("/lcd/staking/pool", JSON.stringify(req.originalUrl))
    res.end(JSON.stringify(stakingPool))
})

app.get('/lcd/txs/:hash', (req, res) => {
  console.log("/lcd/txs/:hash", JSON.stringify(req.originalUrl))

  let response

  if(typeof req.param === "undefined"){
    console.log("ERROR AS UNDEFINED PARAM")
  } else {
        console.log("PARMAS IS", req.params.hash)
       response = loadJSON(`/home/douglas/big-dipper-block-explorer/tests/mockServer/public/transactions/${req.params.hash}`);
  }
      res.end(JSON.stringify(response))
})

app.get('/rpc/validators', (req, res) => {
  console.log("/rpc/validators  22222", JSON.stringify(req.originalUrl))
  const queryKeys = Object.keys(req.query)

  if(!queryKeys.length){
        return res.end(JSON.stringify(validators))
  }

  let result;

  if(queryKeys.includes("status")){
    if (req.query.status === "bonded") {
      console.log("bonded")
      result = JSON.stringify(bondedValidators)
    } else if(req.query.status === "unbonding"){
            console.log("unbonding")
      result = JSON.stringify(unbondedValidators)
    }
  }

  if(queryKeys.includes("height")){
          console.log("height")

      console.log("/rpc/validators  with height ", JSON.stringify(req.originalUrl))

       result = loadJSON(`/home/douglas/big-dipper-block-explorer/tests/mockServer/public/validators/height${req.query.height}`);



  }

  if(typeof result === "undefined"){
     console.log("unmatched url params")
  }

  return res.end(JSON.stringify(result))
})

app.get('/lcd/staking/validators', (req, res) => {
  console.log("/lcd/staking/validators  77777", JSON.stringify(req.originalUrl))
    res.end(JSON.stringify(stakingValidators))
})

app.get('/lcd/supply/total/atestfet', (req, res) => {
  console.log("/lcd/supply/total/atestfet  22222", JSON.stringify(req.originalUrl))
    res.end(JSON.stringify(supply))
})

app.get('/lcd/minting/inflation', (req, res) => {
  console.log("/lcd/minting/inflation  22222", JSON.stringify(req.originalUrl))
    res.end(JSON.stringify(inflation))
})

app.get('/lcd/distribution/community_pool', (req, res) => {
  console.log("/lcd/distribution/community_pool  22222", JSON.stringify(req.originalUrl))
    res.end(JSON.stringify(communityPool))
})

app.get('/lcd/minting/annual-provisions', (req, res) => {
  console.log("/lcd/distribution/annualProvisions  22222", JSON.stringify(req.originalUrl))
    res.end(JSON.stringify(annualProvisions))
})

app.get('/rpc/block', (req, res) => {
  console.log("block  22222", JSON.stringify(req.originalUrl))
  const {height} = req.query

  let response;
try {
    console.log("and height to search for is ", height)
   response = loadJSON(`/home/douglas/big-dipper-block-explorer/tests/mockServer/public/blocks/block${height}`);
}  catch (error) {
        console.log("it throws")
    response = loadJSON('/home/douglas/big-dipper-block-explorer/tests/mockServer/public/blocks/error');
}
        console.log("after block")
    res.end(JSON.stringify(response))
})

app.get('/*', (req, res) => {
  proccess.exit("URL BLOCK EXPLORER REQUESTED NOT FOUND BY MOCK SERVER : " + req.originalUrl)
})

app.listen(port, function () {
  console.log('App listening on port: ' + port)
})
