import React from 'react';
import { Link } from 'react-router-dom';
import {
  Alert, Card, Col, PopoverBody, Row, UncontrolledPopover,
} from 'reactstrap';
import numbro from 'numbro';
import { Markdown } from 'react-showdown';
import { TxIcon } from '../components/Icons.jsx';
import Activities from '../components/Activities.jsx';
import CosmosErrors from '../components/CosmosErrors.jsx';
import TimeAgo from '../components/TimeAgo.jsx';
import Coin from '/both/utils/coins.js';
import SentryBoundary from '../components/SentryBoundary.jsx';

const showdown = require('showdown');

showdown.setFlavor('github');

export const ContractRow = (props) => {
  const { tx } = props;
debugger;

// getContractAddressFromTX(tx)


  return (
    <SentryBoundary>
      <Row className={(tx.code) ? 'tx-info invalid' : 'tx-info'}>
        <Col xs={12} lg={7} className="activity">
            <Link to={`/contracts/${tx.contract_address}`}>
            {tx.contract_address}
          </Link>
        </Col>
        <Col xs={ {size: 12, order: 'last'} } md={ {size: 3, order: 'last'} } lg={{ size: 2, order: 'last' }} className="text-truncate">
          <i className="fas fa-hashtag d-lg-none" />
          {' '}
          <Link to={`/blocks/${tx.starting_height}`}>
            {tx.starting_height}
          </Link>
        </Col>
        <Col xs={ {size: 12, order: 'last'} } md={ {size: 3, order: 'last'} } lg={{ size: 2, order: 'last' }} className="text-truncate">
          <i className="fas fa-hashtag d-lg-none" />
          {' '}
            {tx.txs.length}
        </Col>
        <Col xs={6} md={9} lg={{ size: 2, order: 'last' }} className="text-nowrap">
          <i className="material-icons">schedule</i>
          {' '}
          <span>
            {tx.block() ? <TimeAgo time={tx.block().time} /> : ''}
          </span>
        </Col>
        <Col xs={(!props.blockList) ? 2 : 4} md={1}>
          {(!tx.code) ? <TxIcon valid /> : <TxIcon />}
        </Col>
        {/*<Col xs={(!props.blockList) ? 6 : 8} md={(!props.blockList) ? 9 : 4} lg={2} className="fee">*/}
        {/*  <i className="material-icons d-lg-none">monetization_on</i>*/}
        {/*  {' '}*/}
        {/*  {(tx.tx.value.fee.amount.length > 0) ? tx.tx.value.fee.amount.map((fee, i) => (*/}
        {/*    <span className="text-nowrap" key={i}>*/}
        {/*      {(new Coin(parseFloat(fee.amount), fee.denom)).stakeString()}*/}
        {/*    </span>*/}
        {/*  )) : <span>No fee</span>}*/}
        {/*</Col>*/}
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
