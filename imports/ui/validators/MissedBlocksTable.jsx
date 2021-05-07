import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Card, CardBody, Input, Table,
} from 'reactstrap';
import numbro from 'numbro';
import i18n from 'meteor/universe:i18n';
import Account from '../components/Account.jsx';
import { InfoIcon } from '../components/Icons.jsx';
import TimeStamp from '../components/TimeStamp.jsx';

const DOWNTIMECHUCK = 4;
const T = i18n.createComponent();

const groupData = (missedStats, missedRecords, target) => {
  const validatorsMap = {};
  missedRecords.forEach((record) => {
    const address = record[target];
    if (!validatorsMap[address]) {
      validatorsMap[address] = [];
    }
    validatorsMap[address].push(record);
  });

  const statsMap = {};
  missedStats.forEach((stats) => {
    const address = stats[target];
    statsMap[address] = stats;
  });

  return Object.keys(validatorsMap).map((address) => ({
    address,
    records: validatorsMap[address],
    ...statsMap[address],
  })).sort((a, b) => b.missCount - a.missCount);
};

const aggregateData = (missedRecords) => {
  const aggregatedMissedRecords = [];
  let isChainOngoing = false;
  missedRecords.forEach((record, i) => {
    const { length } = aggregatedMissedRecords;
    if (isChainOngoing) {
      const chain = aggregatedMissedRecords[length - 1];
      if (chain.blocks[chain.blocks.length - 1].blockHeight - record.blockHeight === 1) {
        chain.blocks.push(record);
      } else {
        aggregatedMissedRecords.push(record);
        isChainOngoing = false;
      }
    } else if (length >= DOWNTIMECHUCK && (aggregatedMissedRecords[length - DOWNTIMECHUCK].blockHeight - record.blockHeight) === DOWNTIMECHUCK) {
      const chain = {
        blocks: aggregatedMissedRecords.splice(length - DOWNTIMECHUCK),
      };
      chain.blocks.push(record);
      aggregatedMissedRecords.push(chain);
      isChainOngoing = true;
    } else {
      aggregatedMissedRecords.push(record);
    }
  });
  return aggregatedMissedRecords;
};

const BlockLink = (props) => {
  const { height } = props;
  return (
    <Link to={`/blocks/${height}`}>
      {numbro(height).format('0,0')}
    </Link>
  );
};

export default class MissedBlocksTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expandedRow: -1,
      expandedValidator: -1,
      groupByValidators: this.props.type === 'voter',
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.type !== this.props.type) { this.setState({ groupByValidators: this.props.type === 'voter' }); }
  }

  toggleGroupByValidators = (e) => {
    this.setState({ groupByValidators: e.target.checked });
  }

  toggleExpansion = (selection, e) => {
    const targetKey = e.target.dataset.key;
    this.setState({ [selection]: this.state[selection] === targetKey ? -1 : targetKey });
  }

  renderExpandIcon = (selection, key) => (
    <i className="material-icons" onClick={(e) => this.toggleExpansion(selection, e)} data-key={key}>
      {(this.state[selection] === key) ? 'arrow_drop_down' : 'arrow_right'}
    </i>
  )

  renderSubRow = (record, index) => this.renderRow(record, `sub${index}`, null, true)

  renderRow = (record, index, isSub = false, grouped = false) => {
    if (record.blocks) {
      const isExpanded = Number(this.state.expandedRow) === index;
      const chainSize = record.blocks.length;
      const startBlock = record.blocks[chainSize - 1];
      const lastBlock = record.blocks[0];
      const mainRow = [<tr className="main-row" key={index}>
        <td className="caret" rowSpan={isExpanded ? chainSize + 1 : 1}>
          {this.renderExpandIcon('expandedRow', index)}
        </td>
        <td colSpan="2">
          <BlockLink height={startBlock.blockHeight} />
          {' '}
            -
            <BlockLink height={lastBlock.blockHeight} />
        </td>
        <td colSpan="6">
          <TimeStamp time={startBlock.time} />
          {' '}
            -
            <TimeStamp time={lastBlock.time} />
        </td>
      </tr>];
      const subRows = isExpanded ? record.blocks.map(this.renderSubRow) : [];
      return mainRow.concat(subRows);
    }

    return (
      <tr key={index} className={isSub ? 'sub-row' : 'main-row'}>
        <td colSpan={isSub ? 1 : 2}>
          <BlockLink height={record.blockHeight} />
        </td>
        {grouped ? null : (
          <td>
            <Account sync address={record[this.props.type]} />
          </td>
        )}
        <td>
          <TimeStamp time={record.time} />
        </td>
        <td>
          {`${numbro(parseFloat(record.timeDiff) / 1000).format('0.00')}s`}
        </td>
        <td>
          {record.missCount}
        </td>
        <td>
          {numbro(record.missCount / record.totalCount).format('0.0%')}
        </td>
        <td>
          {`${record.precommitsCount}/${record.validatorsCount}`}
        </td>
        <td>
          {numbro(record.votedVotingPower / record.votingPower).format('0.0%')}
          <InfoIcon tooltipText={`${numbro(record.votedVotingPower).format('0,0')}/${numbro(record.votingPower).format('0,0')}`} />
        </td>
      </tr>
    );
  }

  renderTable = (data, grouped = false) => (
    <Table className="missed-records-table">
      <thead>
        <tr>
          <th colSpan="2">Block Height</th>
          {grouped ? null : (
            <th className="text-capitalize">
              {this.props.type}
            </th>
          )}
          <th>Commit Time</th>
          <th>Block Time</th>
          <th>Missed Count</th>
          <th>
            Missed Ratio
              <InfoIcon tooltipText="Missed ratio at the time of the block" />
          </th>
          <th>
            Signed Ratio
              <InfoIcon tooltipText="Number of voted validators out of all active validators" />
          </th>
          <th>
            Voted Ratio
              <InfoIcon tooltipText="Number of voted voting power out of all active voting power" />
          </th>
        </tr>
      </thead>
      <tbody>
        {aggregateData(data).map((record, index) => this.renderRow(record, index, grouped = grouped))}
      </tbody>
    </Table>
  )

  renderGroupedTable = () => {
    const target = this.props.type;
    const groupedData = groupData(this.props.missedStats, this.props.missedRecords, target);
    return (
      <Table className="missed-records-grouped-table">
        <thead>
          <tr>
            <th />
            <th className="text-capitalize">
              {this.props.type}
            </th>
            <th>Missed Count</th>
            <th>
              Total Count
                <InfoIcon tooltipText="Number of blocks proposed by same proposer where current validator is an active validator" />
            </th>
            <th>Missed Ratio</th>
          </tr>
        </thead>
        <tbody>
          {groupedData.map((validatorData) => {
            const { address } = validatorData;
            const isExpanded = this.state.expandedValidator === address;

            const mainRow = [<tr key={address} className={`validator-row ${isExpanded ? 'expanded' : ''}`}>
              <td className="caret" rowSpan={isExpanded ? 2 : 1}>
                {this.renderExpandIcon('expandedValidator', address)}
              </td>
              <td>
                <Account sync address={address} />
              </td>
              <td>
                {validatorData.missCount}
              </td>
              <td>
                {validatorData.totalCount}
              </td>
              <td>
                {numbro(validatorData.missCount / validatorData.totalCount).format('0.00%')}
                {' '}
                {`(${validatorData.missCount}/${validatorData.totalCount})`}
              </td>
            </tr>];
            const subRow = isExpanded ? (
              <tr className="validator-row sub-row">
                <td colSpan={4}>
                  {this.renderTable(validatorData.records, true)}
                </td>
              </tr>
            ) : [];
            return mainRow.concat(subRow);
          })}
        </tbody>
      </Table>
    );
  }

  render() {
    return (
      <Card className="missed-records-table-card">
        <CardBody>
          <div className="float-right">
            {' '}
            <Input type="checkbox" onClick={this.toggleGroupByValidators} checked={this.state.groupByValidators} />
            {' '}
              Group By Validators
            </div>
          {this.state.groupByValidators ? this.renderGroupedTable() : this.renderTable(this.props.missedRecords)}
        </CardBody>
      </Card>
    );
  }
}
