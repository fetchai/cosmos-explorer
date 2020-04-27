import bech32 from 'bech32';
import { HTTP } from 'meteor/http';
import * as cheerio from 'cheerio';

// Load future from fibers
const Future = Npm.require('fibers/future');
// Load exec
const { exec } = Npm.require('child_process');

function toHexString(byteArray) {
  return byteArray.map(function(byte) {
    return (`0${(byte & 0xFF).toString(16)}`).slice(-2);
  }).join('');
}

Meteor.methods({
  pubkeyToBech32(pubkey, prefix) {
    // '1624DE6420' is ed25519 pubkey prefix
    const pubkeyAminoPrefix = Buffer.from('1624DE6420', 'hex');
    const buffer = Buffer.alloc(37);
    pubkeyAminoPrefix.copy(buffer, 0);
    Buffer.from(pubkey.value, 'base64').copy(buffer, pubkeyAminoPrefix.length);
    return bech32.encode(prefix, bech32.toWords(buffer));
  },
  bech32ToPubkey(pubkey) {
    // '1624DE6420' is ed25519 pubkey prefix
    const pubkeyAminoPrefix = Buffer.from('1624DE6420', 'hex');
    const buffer = Buffer.from(bech32.fromWords(bech32.decode(pubkey).words));
    return buffer.slice(pubkeyAminoPrefix.length).toString('base64');
  },
  getDelegator(operatorAddr) {
    const address = bech32.decode(operatorAddr);
    return bech32.encode(Meteor.settings.public.bech32PrefixAccAddr, address.words);
  },
  getKeybaseTeamPic(keybaseUrl) {
    const teamPage = HTTP.get(keybaseUrl);
    if (teamPage.statusCode == 200) {
      const page = cheerio.load(teamPage.content);
      return page('.kb-main-card img').attr('src');
    }
  },
});
