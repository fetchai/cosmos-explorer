import React from 'react';
import { Link } from 'react-router-dom';
import {
  Alert, Card, Col, Row,
} from 'reactstrap'
import { TxIcon } from '../components/Icons.jsx';
import CosmosErrors from '../components/CosmosErrors.jsx';
import TimeAgo from '../components/TimeAgo.jsx';
import SentryBoundary from '../components/SentryBoundary.jsx';
import Account from '../components/Account'
import { MsgType } from '../components/MsgType'
import i18n from 'meteor/universe:i18n';

const showdown = require('showdown');

showdown.setFlavor('github');

const T = i18n.createComponent();

export const ContractRow = (props) => {
  const { tx } = props;

  /**
   * this component can be used for transactions on a contract or for entire
   */
const  isContractTransaction = (tx) => {
  return Boolean( typeof tx.isContractTransaction !== "undefined" && tx.isContractTransaction === true)
  }


  return (
    <SentryBoundary>
      <Row className={(tx.code) ? 'tx-info invalid contract-row' : 'tx-info contract-row'}>
        <Col xs={12} lg={{ size: 6 }} className="activity card card-body contract-address-box max-width-45">
          {isContractTransaction(tx)? <Card body >
                   <p>
          <Account address={tx.sender} />
          {' '}
          <MsgType type={"cosmos-sdk/MsgSend"} />
          {' '}
          <em className="text-success">
            {tx.amount}
          </em>
          {' '}
          <T>activities.to</T>
          {' '}
          <span className="address">
            <Account address={tx.contract_address} />
          </span>
          <T>common.fullStop</T>
        </p>
            </Card>  :  <Link to={`/contracts/${tx.contract_address}`}>
            {tx.contract_address}
          </Link>
          }
        </Col>
        <Col xs={ {size: 12, order: 'last'} } md={ {size: 3, order: 'last'} } lg={{ size: 2 }} className="text-truncate">
          <i className="fas fa-hashtag d-lg-none" />
          {' '}
          <Link to={`/blocks/${tx.starting_height}`}>
            {tx.starting_height}
          </Link>
        </Col>
        <Col xs={ {size: 12, order: 'last'} } md={ {size: 3, order: 'last'} } lg={{ size: 1 }} className="text-truncate">
          {
            isContractTransaction(tx) ?
           <> <i className="fas fa-hashtag d-lg-none" />
          <Link to={`/contracts/transactions/${tx.txhash}`}>
            {tx.txhash}
          </Link></>
 :
 <><i className="fas fa-hashtag d-lg-none" />
          {' '}
            {tx.txs.length}</>
          }
        </Col>
        <Col xs={6} md={9} lg={{ size: 15, order: 'last' }} className="text-nowrap">
          <i className="material-icons">schedule</i>
          {' '}
          <span>
            <TimeAgo time={new Date(tx.time).getTime()} />
          </span>
        </Col>
        <Col xs={(!props.blockList) ? 2 : 4} md={1}  lg={{ size: 2 }} className="margin-left-row">
          {(!tx.code) ? <TxIcon valid /> : <TxIcon />}
        </Col>
        {(tx.code) ? (
          <Col xs={{ size: 12, order: 'last' }} className="error">
            <Alert color="danger">
              <CosmosErrors
                code={tx.code}
                logs={tx}
                gasWanted={tx.gas_wanted}
                gasUses={tx.gas_used}
              />
            </Alert>
          </Col>
        ) : ''}
      </Row>
    </SentryBoundary>
  );
};
