import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { CoinStats } from '../coin-stats.js';

Meteor.methods({
  'coinStats.getCoinStats'() {
    this.unblock();
    const coinId = Meteor.settings.public.coingeckoId;
    if (coinId) {
      try {
        const now = new Date();
        now.setMinutes(0);
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`;
        const response = HTTP.get(url);
        if (response.statusCode == 200) {
          // console.log(JSON.parse(response.content));
          let data = JSON.parse(response.content);
          data = data[coinId];
          // console.log(coinStats);
          return CoinStats.upsert({ last_updated_at: data.last_updated_at }, { $set: data });
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      return 'No coingecko Id provided.';
    }
  },
  'coinStats.getStats'() {
    this.unblock();
    const coinId = Meteor.settings.public.coingeckoId;
    if (coinId) {
      return (CoinStats.findOne({}, { sort: { last_updated_at: -1 } }));
    }

    return 'No coingecko Id provided.';
  },
});
