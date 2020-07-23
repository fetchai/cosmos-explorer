# Fetch Cosmos Network Explorer

This project is a fork from the excellent [Big Dipper](https://github.com/forbole/big-dipper) block explorer. It has been customised for the requirements of the Fetch.ai testnets.

## How to run Fetch Cosmos Network Explorer

1. Copy `default_settings.json` to `settings.json`.
2. Update the RPC and LCD URLs.
3. Update Bech32 address prefixes.
4. set coingeckoId settings field to an empty string to not show dollar price. 
5. Update genesis file location.

### Requirements

* [Meteor v1.9](https://www.meteor.com/install)

### Run in local

```sh
meteor npm install --save
meteor --settings settings.json
```

### Run in production

```sh
./build.sh
```

It will create a packaged Node JS tarball at `../output`. Deploy that packaged Node JS project with process manager like [PM2](https://github.com/Unitech/pm2) or [Phusion Passenger](https://www.phusionpassenger.com/library/walkthroughs/basics/nodejs/fundamental_concepts.html).

