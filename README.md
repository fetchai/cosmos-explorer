# Fetch.ai Cosmos Network Explorer

This project is a fork from the excellent [Big Dipper](https://github.com/forbole/big-dipper) block explorer. It has been customised for the requirements of the Fetch.ai testnets.

## How to run Fetch Cosmos Network Explorer

1. Copy `default_settings.json` to `settings.json`.
2. Update the RPC and LCD URLs.
3. Update Bech32 address prefixes.
4. set coingeckoId settings field to an empty string to not show dollar price. 
5. Update genesis file location.

### Requirements

* [Meteor v2.x](https://www.meteor.com/install)

### Run in local

```sh
meteor npm install --save
meteor --settings settings.json
```

### Run via docker-compose
```sh
METEOR_SETTINGS=$(cat settings.json) docker-compose up
```

### Run in production

```sh
./scripts/build.sh
```

It will create a packaged Node JS tarball in `Linux x86_64` architecture at `../output`. Deploy that packaged Node JS project with process manager like [PM2](https://github.com/Unitech/pm2) or [Phusion Passenger](https://www.phusionpassenger.com/library/walkthroughs/basics/nodejs/fundamental_concepts.html).

You will need to have [MongoDB >= 4.x](https://docs.mongodb.com/manual/administration/install-on-linux/) installed and [setup environment variables](https://guide.meteor.com/deployment.html#environment) correctly in order run in production. For more details on how to deploy a Meteor application, please refer to the offical documentation on [Custom Deployment](https://guide.meteor.com/deployment.html#custom-deployment). 

### Docker builds

big-dipper docker image is a multi stage build that is based on [disney/meteor-base](https://github.com/disney/meteor-base/). When you change the meteor or node version, change the lines `FROM geoffreybooth/meteor-base:1.12.1` and `FROM node:12.16.1-alpine` respectively. When running the image follow the same [environment variable principles](https://guide.meteor.com/deployment.html#environment) mentioned above. If you get an `non-zero exit (137)` error during the build phase, increase docker container memory and swap limit. Ideally you can set up [remote docker host](https://www.digitalocean.com/community/tutorials/how-to-provision-and-manage-remote-docker-hosts-with-docker-machine-on-ubuntu-18-04) to prevent your computer's fan going brrrrrr.
