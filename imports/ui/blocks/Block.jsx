import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Spinner, NavbarBrand } from 'reactstrap'
import { Link,  } from 'react-router-dom';
import numbro from 'numbro';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import Avatar from '../components/Avatar.jsx';
import TranactionTabs from '../transactions/TransactionTabs.jsx';
import { Helmet } from 'react-helmet';
import i18n from 'meteor/universe:i18n';
import TimeStamp from '../components/TimeStamp.jsx';
import Tooltip from '@material-ui/core/Tooltip/Tooltip'


/**
 * Get substring of address with three appended in middle of  dots; for UI display
 *
 * @param val subject
 * @param number number of chars to keep before and after dots
 * @returns {string} formatted string
 * @param dots how many dots in middle of string
 */
function format(val, number = 12, dots = 5) {
  if (val === '') return ''
  return (
    val.substring(0, number) +
    '.'.repeat(dots) +
    val.substring(val.length - number)
  )
}

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
export default class Block extends Component{
    constructor(props){
        super(props);

        this.state = {
            transferTxs: {},
            stakingTxs: {},
            distributionTxs: {},
            governanceTxs: {},
            slashingTxs: {},
        };
    }

    componentDidUpdate(prevProps){
        if (this.props != prevProps){
            if (this.props.transactionsExist){
                // console.log("have txs.");
                this.setState({
                    transferTxs: this.props.transferTxs,
                    stakingTxs: this.props.stakingTxs,
                    distributionTxs: this.props.distributionTxs,
                    governanceTxs: this.props.governanceTxs,
                    slashingTxs: this.props.slashingTxs,
                    copied: false
                })
            }
        }
    }

       async copy(){
        await copyToClipboard(this.state.DKG.groupSignature);
    this.setState({ copied: true });
    }


    /**
     * we show dkg if settings files specifies it, and if we have dkg in this block,
     *  and the group signature is specified (which it is not in very first few blocks in chain usually)
     *
     */
    showDKGInfo(){

      console.log(" this.state?.DKG?.groupSignature" ,  this.props.block?.dkg?.groupSignature)
      console.log("this.props.blockExist" ,  this.props.blockExist)
debugger;
         const ret = Boolean(Meteor.settings.public.DKGTab && this.props.blockExist && this.props.block.dkg?.groupSignature)
            console.log(" showDKGInfo" ,  ret)
return ret;
    }


    render(){
        if (this.props.loading){
            return <Container id="block">
                <Spinner type="grow" color="primary" />
            </Container>
        }
        else{
            if (this.props.blockExist){
                // console.log(this.props.block);
                let block = this.props.block;
                let proposer = block.proposer();
                let moniker = proposer?proposer.description.moniker:'';
                let profileUrl = proposer?proposer.profile_url:'';

                return <Container id="block">
                    <Helmet>
                         <title>
              Block
              {numbro(block.height).format('0,0')}
              {' '}
              {Meteor.settings.public.networkDisplayName} Explorer
            </title>
                        <meta name="description" content={"Block details of height "+numbro(block.height).format("0,0")} />
                    </Helmet>
                    <h4><T>blocks.block</T> {numbro(block.height).format("0,0")}</h4>
                    <Card>
                        <div className="card-header"><T>common.information</T></div>
                        <CardBody>
                            <Row>
                                <Col md={4} className="label"><T>common.hash</T></Col>
                                <Col md={8} className="value text-nowrap overflow-auto address">{block.hash}</Col>
                                <Col md={4} className="label"><T>blocks.proposer</T></Col>
                                <Col md={8} className="value"><Link to={"/validator/"+((proposer)?proposer.operator_address:'')}><Avatar moniker={moniker} profileUrl={profileUrl} address={block.proposerAddress} list={true} /> {moniker}</Link></Col>
                                <Col md={4} className="label"><T>blocks.numOfTransactions</T></Col>
                                <Col md={8} className="value">{numbro(block.transNum).format("0,0")}</Col>
                                <Col md={4} className="label"><T>common.time</T></Col>
                                <Col md={8} className="value"><TimeStamp time={block.time}/> ({moment(block.time).fromNow()})</Col>
                                    {
                                        this.showDKGInfo() ?
                                          <>
                                            <hr  className={"DKG-value-hr"}></hr>
                                         <Col md={4} className="label DKG-list-header"><T>DKG.entropy</T></Col>
                                         <Col md={8} className="value text-nowrap overflow-auto address"></Col>

                                          <Col md={4} className="label" onClick={this.copy} data-tooltip-positions="bottom;left;top;right"><span className={"DKG-value"}><T>DKG.groupSignature</T></span></Col>

                                           {/*<Tooltip title={this.state.copied? <span className="toolTip">Copied!</span> : <span className="toolTip">Copy to Clipboard</span>}>*/}
                                           <Col md={8} onClick={this.copy} data-tooltip-positions="bottom;left;top;right" className="value text-nowrap overflow-auto address">
                                             {format(block.dkg.groupSignature, 30)}
                                           <img src="/img/clipboard.svg" className="clipboard"/>
                                           </Col>

                                           {/*</Tooltip>*/}
                                          <Col md={4} className="label" onClick={this.copy} data-tooltip-positions="bottom;left;top;right"><span className={"DKG-value"}><T>DKG.round</T></span></Col>
                                           <Col md={8} className="value text-nowrap overflow-auto address">{block.dkg.round}</Col>

                                          <Col md={4} className="label" onClick={this.copy} data-tooltip-positions="bottom;left;top;right"><span className={"DKG-value"}><T>DKG.startBlock</T></span></Col>
                                           <Col md={8} className="value text-nowrap overflow-auto address">{block.dkg.startBlock}</Col>

                                          <Col md={4} className="label" onClick={this.copy} data-tooltip-positions="bottom;left;top;right"><span className={"DKG-value"}><T>DKG.endBlock</T></span></Col>
                                           <Col md={8} className="value text-nowrap overflow-auto address">{block.dkg.endBlock}</Col>

                                      </>
                                          : ""
                                    }
                            </Row>
                        </CardBody>
                    </Card>
                    <TranactionTabs
                        transferTxs={this.state.transferTxs}
                        stakingTxs={this.state.stakingTxs}
                        distributionTxs={this.state.distributionTxs}
                        governanceTxs={this.state.governanceTxs}
                        slashingTxs={this.state.slashingTxs}
                        DKG={block.dkg}
                    />
                </Container>
            }
            else{
                return <Container id="block"><div><T>block.notFound</T></div></Container>
            }
        }
    }
}