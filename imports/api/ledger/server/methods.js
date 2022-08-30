import { HTTP } from "meteor/http";
import { Validators } from "../../validators/validators";
import Big from "big.js";
import {
  encodePubkey,
  makeAuthInfoBytes,
  Registry,
} from "@cosmjs/proto-signing";
import {
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createGovAminoConverters,
  createStakingAminoConverters,
  createIbcAminoConverters,
  createFreegrantAminoConverters,
  defaultRegistryTypes,
  AminoTypes,
} from "@cosmjs/stargate";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Int53 } from "@cosmjs/math";
import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";

Meteor.methods({
  "transaction.submit": function (txInfo) {
    this.unblock();
    const url = `${API}/cosmos/tx/v1beta1/txs`;
    const timestamp = new Date().getTime();
    console.log(
      `submitting transaction${timestamp} ${url} with data before encoding: ${JSON.stringify(
        txInfo
      )}`
    );

    legacyTx = txInfo.value;
    // Encode legacy StdTx to proto bytes needed by /cosmos/tx/v1beta1/txs endpoint
    let registry = new Registry(defaultRegistryTypes);
    let aminoTypes = new AminoTypes({
      ...createAuthzAminoConverters(),
      ...createBankAminoConverters(),
      ...createDistributionAminoConverters(),
      ...createGovAminoConverters(),
      ...createStakingAminoConverters("fetch"),
      ...createIbcAminoConverters(),
      ...createFreegrantAminoConverters(),
    });
    const signedTxBody = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: {
        messages: legacyTx.msg.map((msg) => aminoTypes.fromAmino(msg)),
        memo: legacyTx.memo,
      },
    };
    console.log("signed tx body", JSON.stringify(signedTxBody));
    const signedTxBodyBytes = registry.encode(signedTxBody);
    const signedGasLimit = Int53.fromString(legacyTx.fee.gas).toNumber();
    const signedSequence = Int53.fromString(
      legacyTx.signatures[0].sequence
    ).toNumber();

    const pubkey = encodePubkey(legacyTx.signatures[0].pub_key);

    const signedAuthInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence: signedSequence }],
      legacyTx.fee.amount,
      signedGasLimit,
      SignMode.SIGN_MODE_LEGACY_AMINO_JSON
    );

    const rawTx = TxRaw.fromPartial({
      bodyBytes: signedTxBodyBytes,
      authInfoBytes: signedAuthInfoBytes,
      signatures: [fromBase64(legacyTx.signatures[0].signature)],
    });

    let data = {
      tx_bytes: toBase64(TxRaw.encode(rawTx).finish()),
      mode: "BROADCAST_MODE_SYNC",
    };

    let response = HTTP.post(url, { data });
    console.log(
      `response for transaction${timestamp} ${url}: ${JSON.stringify(response)}`
    );
    if (response.statusCode == 200) {
      let data = response.data.tx_response;
      if (data.code)
        throw new Meteor.Error(data.code, JSON.parse(data.raw_log).message);
      return data.txhash;
    }
  },
  "get.rewards": function (delegatorBech32) {
    this.unblock();
    const url = `${API}/cosmos/distribution/v1beta1/delegators/${delegatorBech32}/rewards`;
    console.log("getDelegations", url);
    let response = HTTP.get(url);
    if (response.statusCode == 200) {
      return JSON.parse(response.content);
    }
  },
  "transaction.simulate": function (txMsg, adjustment = "1.2") {
    this.unblock();
    const url = `${API}/cosmos/tx/v1beta1/simulate`;
    let aminoTypes = new AminoTypes({
      ...createAuthzAminoConverters(),
      ...createBankAminoConverters(),
      ...createDistributionAminoConverters(),
      ...createGovAminoConverters(),
      ...createStakingAminoConverters("fetch"),
      ...createIbcAminoConverters(),
      ...createFreegrantAminoConverters(),
    });
    let legacyTx = txMsg.value;
    console.log("simulate", JSON.stringify(legacyTx));
    const signedTxBody = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: {
        messages: legacyTx.msg.map((msg) => aminoTypes.fromAmino(msg)),
        memo: legacyTx.memo,
      },
    };

    let registry = new Registry(defaultRegistryTypes);
    const signedTxBodyBytes = registry.encode(signedTxBody);
    const pubkey = encodePubkey(legacyTx.signatures[0].pub_key);
    const signedSequence = Int53.fromString(
      legacyTx.signatures[0].sequence
    ).toNumber();

    const signedAuthInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence: signedSequence }],
      [],
      0,
      SignMode.SIGN_MODE_LEGACY_AMINO_JSON
    );

    const rawTx = TxRaw.fromPartial({
      bodyBytes: signedTxBodyBytes,
      authInfoBytes: signedAuthInfoBytes,
      signatures: legacyTx.signatures,
    });

    data = {
      tx_bytes: toBase64(TxRaw.encode(rawTx).finish()),
    };
    let response = HTTP.post(url, { data });
    if (response.statusCode == 200) {
      return Big(JSON.parse(response.content).gas_info.gas_used)
        .mul(Big(adjustment))
        .round(0)
        .toString();
    }
  },
  isValidator: function (address) {
    this.unblock();
    let validator = Validators.findOne({ delegator_address: address });
    return validator;
  },
});
