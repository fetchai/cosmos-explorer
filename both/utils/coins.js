/* eslint-disable no-tabs */
import { Meteor } from 'meteor/meteor';
import numbro from 'numbro';
import Big from 'big.js';

Big.PE = 21
Big.NE = -21
Big.RM = Big.roundDown

const coinList = Meteor.settings.public.coins;

export default class Coin {
    static StakingCoin = coinList.find(coin => coin.denom === Meteor.settings.public.bondDenom);

    constructor(amount, denom = Meteor.settings.public.bondDenom) {
        const lowerDenom = denom.toLowerCase();
        this._coin = coinList.find(coin =>
            coin.denom.toLowerCase() === lowerDenom || coin.displayName.toLowerCase() === lowerDenom
        );

        if (!this._coin) {
            throw "no coin with denom '" + denom + "' from settings"
        }

        this._coin.fraction = Big(this._coin.fraction)
        this._displayDecimals = 6
        this._fractionDisplayThreshold = this._coin.fraction.div(Big(10).pow((this._displayDecimals - 1)));

        if (lowerDenom === this._coin.denom.toLowerCase()) {
            this._amount = Big(amount);
        } else {
            this._amount = Big(amount).mul(this._coin.fraction);
        }
    }

    toString() {
        let amount = this._amount;
        let denom = this._coin.denom;
        if (this._amount.gt(this._fractionDisplayThreshold)) {
            amount = amount.div(this._coin.fraction);
            denom = this._coin.displayName;
        }

        let displayDecimals = this._displayDecimals;
        if (amount.round(this._displayDecimals, Big.roundDown).eq(amount)) {
            displayDecimals = 0;
        }

        return `${amount.toFixed(displayDecimals)} ${denom}`
    }
}
