import React, { Component } from 'react';

import { AccAddress, useBech32Config } from "@everett-protocol/cosmosjs/common/address";
import { defaultBech32Config } from "@everett-protocol/cosmosjs/core/bech32Config";

import i18n from 'meteor/universe:i18n';
import { SuccessModal } from "./successModal";
import { TokenTapModal } from "./tokenTapModal";

/**
 *
 *
 * @param url
 * @param data
 * @returns {Promise<{(url: string): Request; <ParsedObject extends {[p: string]: any}>(url: string, callback: (this:Request, error: any, d: ParsedObject) => void): Request}>}
 */
async function postData(url = '', data = {}) {

    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return response
}

const T = i18n.createComponent();

export default class TokenTap extends Component {
    constructor(props) {
        super(props);
        this.addressChange = this.addressChange.bind(this)
        this.validCosmosAddress = this.validCosmosAddress.bind(this)
        this.submit = this.submit.bind(this)
        this.hideSuccessModal = this.hideSuccessModal.bind(this)
        this.hide = this.hide.bind(this)

        // set visibility state of main token tap modal
        this.setModalState = props.setModalState

        this.state = {
            success: false,
            showModal: false,
            address: "",
            error: ""
        }
    }

    hide() {
        this.setModalState(false)
        this.setState({ error: "" })
    }

    validCosmosAddress = (address) => {

        return useBech32Config(defaultBech32Config("fetch"), () => {
            try {
                AccAddress.fromBech32(address);
            } catch (e) {
                return false
            }
            return true;
        })
    }

    addressChange = (event) => {
        this.setState({ address: event.target.value })
    }


    hideSuccessModal = () => {
        this.setState({ success: false })
    }


    submit = async (event) => {
        event.preventDefault();

        if (!this.validCosmosAddress(this.state.address)) {
            return this.setState({ error: <T>common.invalidAddress</T>, success: "" })
        }

        // const url = Meteor.settings.public.lcd + "/claim";
        const url = Meteor.settings.public.tokenTapURL;

        let error = false;
        let response;


        try {
            response = await postData(url, { address: this.state.address })
        } catch (err) {
            error = true;
        }
        if (typeof response !== "undefined" && response.status !== 200) error = true;

        if (error) {
            this.setState({ error: <T>common.error</T>, success: false })
        } else {
            this.setModalState(false)
            this.setState({ success: true })

        }

    }

    componentDidUpdate(prevProps) {
        if (prevProps.showModal != this.props.showModal) {
            this.setState({
                showModal: this.props.showModal
            })
        }
    }

    render() {
        return <><TokenTapModal show={this.state.showModal} hide={this.hide} value={this.state.address}
            onChange={this.addressChange} error={this.state.error} success={this.state.success}
            onClick={this.submit} />
            <SuccessModal show={this.state.success} onHide={this.hideSuccessModal} address={this.state.address} />
        </>
    }
}
