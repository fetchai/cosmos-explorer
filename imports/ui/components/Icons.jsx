import React from 'react';
import { UncontrolledTooltip } from 'reactstrap';

export const DenomSymbol = (props) => {
  switch (props.denom) {
  case 'steak':
    return '🥩';
  default:
    return '🍅';
  }
};


export const ProposalStatusIcon = (props) => {
  switch (props.status) {
  case 'Passed':
    return <i className="fas fa-check-circle text-success" />;
  case 'Rejected':
    return <i className="fas fa-times-circle text-danger" />;
  case 'Removed':
    return <i className="fas fa-trash-alt text-dark" />;
  case 'DepositPeriod':
    return <i className="fas fa-battery-half text-warning" />;
  case 'VotingPeriod':
    return <i className="fas fa-hand-paper text-info" />;
  default:
    return <i />;
  }
};

export const VoteIcon = (props) => {
  switch (props.vote) {
  case 'yes':
    return <i className="fas fa-check text-success" />;
  case 'no':
    return <i className="fas fa-times text-danger" />;
  case 'abstain':
    return <i className="fas fa-user-slash text-warning" />;
  case 'no_with_veto':
    return <i className="fas fa-exclamation-triangle text-info" />;
  default:
    return <i />;
  }
};

export const TxIcon = (props) => {
  if (props.valid) {
    return (
      <span className="text-success text-nowrap">
        <i className="fas fa-check-circle" />
      </span>
    );
  }

  return (
    <span className="text-danger text-nowrap">
      <i className="fas fa-times-circle" />
    </span>
  );
};

export class InfoIcon extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  render() {
    return [
      <i key="icon" className="material-icons info-icon" ref={this.ref}>info</i>,
      <UncontrolledTooltip key="tooltip" placement="right" target={this.ref}>
        {this.props.children ? this.props.children : this.props.tooltipText}
      </UncontrolledTooltip>,
    ];
  }
}
