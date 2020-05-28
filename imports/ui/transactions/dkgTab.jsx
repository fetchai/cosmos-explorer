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
    }

    render(){

    if(!this.state.DKG) {
        return <Container id="transaction">
            <Spinner type="grow" color="primary"/>
        </Container>
    }

    return <ul>
           <li>this.state.DKG</li>
           <li></li>
           <li></li>
       </ul>
    }
}