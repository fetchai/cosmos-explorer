import React from 'react';
import { Link } from 'react-router-dom';
import {
  Alert, Col, Row,
} from 'reactstrap';
import { TxIcon } from '../components/Icons.jsx';
import CosmosErrors from '../components/CosmosErrors.jsx';
import TimeAgo from '../components/TimeAgo.jsx';
import SentryBoundary from '../components/SentryBoundary.jsx';

const showdown = require('showdown');

showdown.setFlavor('github');

export const ContractRow = (props) => {
  const { tx } = props;

  return (
    <SentryBoundary>
      <Row className={(tx.code) ? 'tx-info invalid' : 'tx-info '}>
        <Col xs={12} lg={7} className="activity card card-body contract-address-box">
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
        <Col xs={ {size: 12, order: 'last'} } md={ {size: 3, order: 'last'} } lg={{ size: 1, order: 'last' }} className="text-truncate">
          <i className="fas fa-hashtag d-lg-none" />
          {' '}
            {tx.txs.length}
        </Col>
        <Col xs={6} md={9} lg={{ size: 2, order: 'last' }} className="text-nowrap">
          <i className="material-icons">schedule</i>
          {' '}
          <span>
            <TimeAgo time={new Date(tx.time).getTime()} />
          </span>
        </Col>
        <Col xs={(!props.blockList) ? 2 : 4} md={1}>
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
