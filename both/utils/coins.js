/* eslint-disable no-tabs */
import { Meteor } from "meteor/meteor";
import numbro from "numbro";
import Big from "big.js";

// disable scientific notation usage
Big.NE = -1e6;
Big.PE = +1e6;

Big.RM = Big.roundDown;

const coinList = Meteor.settings.public.coins;

export default class Coin {
  static StakingCoin = coinList.find(
    (coin) => coin.denom === Meteor.settings.public.bondDenom
  );

  constructor(amount, denom = Meteor.settings.public.bondDenom) {
    const lowerDenom = denom.toLowerCase();
    this._coin = coinList.find(
      (coin) =>
        coin.denom.toLowerCase() === lowerDenom ||
        coin.displayName.toLowerCase() === lowerDenom
    );

    if (!this._coin) {
      this._coin = {
        denom: denom,
        displayName: denom,
        fraction: 1,
      };
    }

    // denom => afet
    // displayName => FET

    // divider used to convert between denom or displayName representation
    this._coin.fraction = Big(this._coin.fraction);
    // threshold used to switch display of a coin between its denom or displayName representations.
    this._fractionDisplayThreshold = this._coin.fraction.div(Big(1000000));

    if (!amount) {
      amount = 0;
    }

    if (lowerDenom === this._coin.denom.toLowerCase()) {
      this._amount = Big(amount);
    } else {
      this._amount = Big(amount).mul(this._coin.fraction);
    }
  }

  get amount() {
    return this._amount;
  }

  toString() {
    let amount = this._amount;
    let denom = this._coin.denom;
    // when amount is below this threshold, denom value will be used
    // when above, it will be converted to displayName.
    if (this._amount.gt(this._fractionDisplayThreshold)) {
      amount = amount.div(this._coin.fraction);
      denom = this._coin.displayName;
    }

    let format = "0,0.000000";
    // removes unecessary decimals
    if (amount.eq(amount.round(0, Big.roundDown))) {
      format = "0,0";
    }
    return `${numbro(amount.toString()).format(format)} ${denom}`;
  }
}
