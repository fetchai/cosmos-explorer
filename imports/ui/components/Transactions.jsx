import React, { Component } from 'react';
import { Card, Spinner } from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import TransactionTabs from '../transactions/TransactionTabs.jsx';

const T = i18n.createComponent();

export default class ValidatorTransactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transferTxs: {},
      stakingTxs: {},
      distributionTxs: {},
      governanceTxs: {},
      slashingTxs: {},
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props != prevProps) {
      if (this.props.transactionsExist) {
        // console.log(`have txs. ${JSON.stringify(this.props.transferTxs)}`);
        this.setState({
          transferTxs: this.props.transferTxs,
          stakingTxs: this.props.stakingTxs,
          distributionTxs: this.props.distributionTxs,
          governanceTxs: this.props.governanceTxs,
          slashingTxs: this.props.slashingTxs,
        });
      }
    }
  }

  render() {
    if (this.props.loading) {
      return <Spinner color="primary" type="glow" />;
    }
    if (this.props.transactionsExist) {
      return (
        <TransactionTabs
          transferTxs={this.state.transferTxs}
          stakingTxs={this.state.stakingTxs}
          distributionTxs={this.state.distributionTxs}
          governanceTxs={this.state.governanceTxs}
          slashingTxs={this.state.slashingTxs}
        />
      );
    }

    return (
      <Card body>
        <T>transactions.noValidatorTxsFound</T>
      </Card>
    );
  }
}
