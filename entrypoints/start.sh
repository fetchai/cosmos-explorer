#!/usr/bin/env bash

# Setting environment variables for nodeds
export METEOR_SETTINGS_FILE=/config/settings.json
export ROOT_URL=${BLOCKEXPLORERURL}

# install compiled application
cd /opt/big_dipper/bundle/programs/server && npm install --production

export PORT=3000
export METEOR_SETTINGS="$(cat $METEOR_SETTINGS_FILE)"
node /opt/big_dipper/bundle/main.js