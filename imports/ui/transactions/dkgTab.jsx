import React, { Component } from 'react';
import i18n from 'meteor/universe:i18n';
import {Container, Spinner} from "reactstrap";
import Tooltip from '@material-ui/core/Tooltip';

async function copyToClipboard (str) {
  return new Promise((resolve) => {
    navigator.clipboard.writeText(str).then(() => {
      resolve(true)
    }, () => {
      resolve(false)
    })
  })
}


const T = i18n.createComponent();
export default class DKGTab extends Component{
    constructor(props){
        super(props);
        this.getGroupSignatureDisplayString = this.getGroupSignatureDisplayString.bind(this)
        this.copy = this.copy.bind(this)
        this.state = {
           DKG: this.props.DKG,
            copied: false
        }
    }

   async copy(){
        await copyToClipboard(this.state.DKG.groupSignature);
    this.setState({ copied: true });
    }

    getGroupSignatureDisplayString(){
        return  this.state.DKG.groupSignature;
    // return this.state.DKG.groupSignature.substring(0, 20) + "..." + this.state.DKG.groupSignature.substring(this.state.DKG.groupSignature.length -20)
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
    if (!this.state.DKG) {
        return <Container id="transaction">
            <Spinner type="grow" color="primary"/>
        </Container>
    }

    return <><ul className="DKG-list">

        <Tooltip title={this.state.copied? <span className="toolTip">Copied!</span> : <span className="toolTip">Copy to Clipboard</span>} >
        <li className="signature"
            onClick={this.copy}
            data-tooltip-positions="bottom;left;top;right">
            <T>DKG.groupSignature</T>{this.getGroupSignatureDisplayString()}</li></Tooltip>
        <li><T>DKG.round</T>{this.state.DKG.round}</li>
        <li><T>DKG.startBlock</T>{this.state.DKG.startBlock}</li>
        <li><T>DKG.endBlock</T>{this.state.DKG.endBlock}</li>
    </ul>
          {this.state.DKG.txIds && this.state.DKG.txIds.length ? <>
        <h3 className="DKG-title"><T>DKG.txIds</T></h3>
            <ul className="DKG-list">
                {this.state.DKG.txIds.map(id => <li>${id}</li>)}
            </ul></>: ""}</>

}
}