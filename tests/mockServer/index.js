const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()
const port = 4000;

const dumpConsensusState = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/dump_consensus_state");
const status = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/status");
const proposals = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/proposals");
const validators = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/validators");
const stakingPool = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/staking-pool");
const supply = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/supply");
const communityPool = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/community-pool");
const inflation = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/inflation");
const stakingValidators = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/staking-validators");
const annualProvisions = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/annual-provisions");
const bondedValidators = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/bonded-validators");
const unbondedValidators = loadJSON("/home/douglas/big-dipper-block-explorer/tests/mockServer/public/unbonded-validators");


function loadJSON(file) {
    var data = fs.readFileSync(file);
    return JSON.parse(data);
}

console.log("fff", dumpConsensusState)
debugger;

app.use(express.static(path.join(__dirname, './public')));

app.get('/rpc/dump_consensus_state', (req, res) => {
  console.log("dump_consensus_state22222", JSON.stringify(req.originalUrl))
    res.end(JSON.stringify(dumpConsensusState))
})

app.get('/rpc/status', (req, res) => {
  console.log(" /rpc/status 22222", JSON.stringify(req.originalUrl))
    res.end(JSON.stringify(status))
})

app.get('/lcd/gov/proposals', (req, res) => {
  console.log("/lcd/gov/proposals  22222", JSON.stringify(req.originalUrl))
    res.end(JSON.stringify(proposals))
})

app.get('/lcd/staking/pool', (req, res) => {
  console.log("/lcd/staking/pool  22222", JSON.stringify(req.originalUrl))
    res.end(JSON.stringify(stakingPool))
})

app.get('/rpc/validators', (req, res) => {
  console.log("/rpc/validators  22222", JSON.stringify(req.originalUrl))


  if(typeof req.query.status === "undefined"){
    console.log("no query string")
    res.end(JSON.stringify(validators))
  } else if(req.query.status === "bonded"){
        console.log("query string bonded")
        res.end(JSON.stringify(bondedValidators))
  } else if(req.query.status === "unbonded") {
            console.log("query string unbonded")
            res.end(JSON.stringify(unbondedValidators))
  } else {
            console.log("query string not matches")

  }
})

app.get('/lcd/staking/validators', (req, res) => {
  console.log("/lcd/staking/validators  22222", JSON.stringify(req.originalUrl))
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

  let response
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
  debugger;
  console.log("reqqqqqq", JSON.stringify(req.originalUrl))
})

app.listen(port, function () {
  console.log('App listening on port: ' + port)
})
