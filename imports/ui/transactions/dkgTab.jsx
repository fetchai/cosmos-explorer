import React, { Component } from 'react';
import i18n from 'meteor/universe:i18n';
import {Container, Spinner} from "reactstrap";


const T = i18n.createComponent();
export default class DKGTab extends Component{
    constructor(props){
        super(props);
        this.state = {
           DKG: this.props.DKG
        }
    }
    componentDidUpdate(prevProps){
        if (this.props != prevProps){
                this.setState({
                 DKG: this.props.DKG
                })
            }
        }

    render()
{
    debugger;
    if (!this.state.DKG) {
        return <Container id="transaction">
            <Spinner type="grow" color="primary"/>
        </Container>
    }

    /**
     *  blockData.dkg.round = response.data.result.block.header.entropy.round
     blockData.dkg.startBlock = response.data.result.block.header.entropy.dkg_id
     blockData.dkg.groupSignature = response.data.result.block.header.entropy.group_signature
     blockData.dkg.EndBlock = response.data.result.block.header.entropy.dkg_id + response.data.result.block.header.entropy.aeon_length
     blockData.dkg.txIds
     */

    return <><ul>
        <li>Group Signature: {this.state.DKG.groupSignature}</li>
        <li>DKG Round: {this.state.DKG.round}</li>
        <li>DKG Start Block: {this.state.DKG.startBlock}</li>
        <li>DKG End Block: {this.state.DKG.endBlock}</li>
    </ul>
        <h3>Table of DKG Transactions</h3>
        {this.state.DKG.length ?
            <ul>
                {this.state.DKG.map(id => `<li>${id}</li>`)}
            </ul>: ""}</>

}
}