import React, { Component } from 'react';
import { HorizontalBar } from 'react-chartjs-2';
import { Card, CardBody, Spinner } from 'reactstrap';
import numbro from 'numbro';
import i18n from 'meteor/universe:i18n';
import SentryBoundary from '../components/SentryBoundary.jsx';


const T = i18n.createComponent();

const darkBlueRGBPart = '88, 135, 218';

export default class VotingPower extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      options: {},
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.stats != this.props.stats) {
      const self = this;

      const labels = [];
      const data = [];
      let totalVotingPower = 0;
      const accumulatePower = [];
      const backgroundColors = [];

      for (const i in this.props.stats) {
        totalVotingPower += this.props.stats[i].voting_power;
        if (i > 0) {
          accumulatePower[i] = accumulatePower[i - 1] + this.props.stats[i].voting_power;
        } else {
          accumulatePower[i] = this.props.stats[i].voting_power;
        }
      }

      for (const v in this.props.stats) {
        labels.push(this.props.stats[v].description ? this.props.stats[v].description.moniker : '');
        data.push(this.props.stats[v].voting_power);
        const alpha = (this.props.stats.length + 1 - v) / this.props.stats.length * 0.8 + 0.2;
        backgroundColors.push(`rgba(${darkBlueRGBPart}, ${alpha})`);
      }
      this.setState({
        data: {
          labels,
          datasets: [
            {
              label: 'Voting Power',
              data,
              backgroundColor: backgroundColors,
            },
          ],
        },
        options: {
          tooltips: {
            callbacks: {
              label(tooltipItem, data) {
                return `${numbro(data.datasets[0].data[tooltipItem.index]).format('0,0')} (${numbro(data.datasets[0].data[tooltipItem.index] / totalVotingPower).format('0.00%')}, ${numbro(accumulatePower[tooltipItem.index] / totalVotingPower).format('0.00%')})`;
              },
            },
          },
          maintainAspectRatio: false,
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true,
                userCallback(value, index, values) {
                  // Convert the number to a string and splite the string every 3 charaters from the end
                  return numbro(value).format('0,0');
                },
              },
            }],
          },
        },
      });

      $('#voting-power-chart').height(16 * data.length);
    }
  }

  render() {
    if (this.props.loading) {
      return <Spinner type="grow" color="primary" />;
    }

    if (this.props.statsExist && this.props.stats) {
      return (
        <Card>
          <div className="card-header">
            <T>common.votingPower</T>
          </div>
          <CardBody id="voting-power-chart">
            <SentryBoundary>
              <HorizontalBar data={this.state.data} options={this.state.options} />
            </SentryBoundary>
          </CardBody>
        </Card>
      );
    }

    return <div />;
  }
}
