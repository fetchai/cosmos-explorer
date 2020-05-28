import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  AccAddress
} from "@everett-protocol/cosmosjs/common/address";
import i18n from 'meteor/universe:i18n';


async function postData(url = '', data = {}) {
  // Default options are marked with *
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
  return response.json(); // parses JSON response into native JavaScript objects
}

const T = i18n.createComponent();
export default class Consensus extends Component{
    constructor(props){
        super(props);
        this.addressChange = this.addressChange.bind(this)
        this.validAddress = this.validAddress.bind(this)


        this.state = {
            showModal: false,
            address: ""
        }
    }



validAddress = (address) => {
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

submit = (event) => {
    event.preventDefault();

    if(!validAddress(this.state.address)){
         return this.setState({error: <T>common.invalidAddress</T>})
    }

const url = Meteor.settings.public.lcd + "/claim";
    postData(url, {address: this.state.address})



}







    componentDidUpdate(prevProps){
        if (prevProps.showModal != this.props.showModal){
                    this.setState({
                        showModal:this.props.showModal
                    })
            }
        }

    render(){
        <Modal animation={false} style={{ opacity: 1 }} show={this.state.showModal} onHide={this.handleClose}>
    <Modal.Header closeButton>
        <Modal.Title>Create New Address</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <form id="form">
            <p>
                <label htmlFor="pending_address_name">Name:</label>
                <input id="pending_address_name" className={'modal-form-input'} name="pending_address_name" type="text"
                    value={this.state.address}
                    onChange={this.addressChange} />
                <br></br><span className={'modal_error'}> {this.state.modal_error}</span>
            </p>
        </form>
        <p>These Test Addresses get Wealth Automatically assigned<Download/p>
    </Modal.Body>
    <Modal.Footer>
        <Button onClick={this.submit}>
            Add New Address
    </Button>
    </Modal.Footer>
</Modal>
    }
}