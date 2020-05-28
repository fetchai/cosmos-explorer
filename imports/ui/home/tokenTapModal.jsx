import React, { Component } from 'react';

import {
  AccAddress
} from "@everett-protocol/cosmosjs/common/address";

import i18n from 'meteor/universe:i18n';
import Modal from "react-bootstrap/Modal";

async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data)
  });

  if(response.status !== 200) throw new Error()

  const json = response.json().catch(err => throw new Error());

  return json;

}

const T = i18n.createComponent();


export default class tokenTapModal extends Component{
    constructor(props){
        super(props);
        this.addressChange = this.addressChange.bind(this)
        this.validCosmosAddress = this.validCosmosAddress.bind(this)
        this.hide = this.hide.bind(this)
        this.submit = this.submit.bind(this)

        this.state = {
            showModal: false,
            address: "",
            error: ""
        }
    }

hide = () => {
     this.setState({showModal: false, error: ""})
}

validCosmosAddress = (address) => {
try {
  AccAddress.fromBech32(address);
} catch (e) {
 return false
}
return true
}

addressChange = (event) => {
    this.setState({address: event.target.value})
}

submit = async (event) => {
    event.preventDefault();

    if(!this.validCosmosAddress(this.state.address)){
         return this.setState({error: <T>common.invalidAddress</T>})
    }

    const url = Meteor.settings.public.lcd + "/claim";

    let error = false;

    try {
        await postData(url, {address: this.state.address})
    } catch(err) {
           error = true;
    }

    if(error){
         return this.setState({error: <T>common.error</T>})
    } else {
         return this.setState({showModal: false})
    }

    }

    componentDidUpdate(prevProps){
        if (prevProps.showModal != this.props.showModal){
                    this.setState({
                        showModal:this.props.showModal,
                        error: ""
                    })
            }
        }

    render(){
       return  <Modal animation={false} style={{ opacity: 1 }} show={this.state.showModal} onHide={this.hide}>
    <Modal.Header closeButton>
        <Modal.Title>Add funds to Fetch Account</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <form id="form">
            <p>
                <label htmlFor="pending_address_name">Address</label>
                <input id="pending_address_name" className={'modal-form-input'} name="pending_address_name" type="text"
                    value={this.state.address}
                    onChange={this.addressChange} />
                <br></br><span className="modal_error"> {this.state.error}</span>
            </p>
        </form>
    </Modal.Body>
    <Modal.Footer>
        <button onClick={this.submit}>
            Add Funds
    </button>
    </Modal.Footer>
</Modal>
    }
}