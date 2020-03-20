import React, { Component } from 'react';
import {Line} from 'react-chartjs-2';
import { Row, Col, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, Progress, Spinner } from 'reactstrap';
import moment from 'moment';
import i18n from 'meteor/universe:i18n';
import TimeStamp from '../components/TimeStamp.jsx';
import SentryBoundary from '../components/SentryBoundary.jsx';


const T = i18n.createComponent();
const fetchColor01 = '#b57ba9';
const fetchColor11 = '#b57ba9';

const fetchColor02 = '#9bb7e9';
const fetchColor12 = '#9bb7e9';

const fetchColor03 = '#80d2c6';
const fetchColor13 = '#2bb5a2';

export default class Chart extends Component{
    constructor(props){
        super(props);
        this.state = {
            vpData: {},
            timeData: {},
            optionsTime: {},
            optionsVP: {}
        }
    }

    componentDidUpdate(prevProps){
        if (prevProps.history != this.props.history){
            let dates = [];
            let heights = [];
            let blockTime = [];
            let timeDiff = [];
            let votingPower = [];
            let validators = [];
            for (let i in this.props.history){
                dates.push(moment.utc(this.props.history[i].time).format("D MMM YYYY, h:mm:ssa z"));
                heights.push(this.props.history[i].height);
                blockTime.push((this.props.history[i].averageBlockTime/1000).toFixed(2));
                timeDiff.push((this.props.history[i].timeDiff/1000).toFixed(2));
                votingPower.push(this.props.history[i].voting_power);
                validators.push(this.props.history[i].precommits);
            }
            this.setState({
                vpData:{
                    labels:dates,
                    datasets: [
                        {
                            label: 'Voting Power',
                            fill: false,
                            lineTension: 0,
                            yAxisID: 'VotingPower',
                            pointRadius: 1,
                            borderColor: fetchColor12,
                            borderJoinStyle: 'round',
                            backgroundColor: fetchColor02,
                            data: votingPower
                        },
                        {
                            label: 'No. of Validators',
                            fill: false,
                            lineTension: 0,
                            yAxisID: 'Validators',
                            pointRadius: 1,
                            borderColor: fetchColor13,
                            borderJoinStyle: 'round',
                            backgroundColor: fetchColor03,
                            data: validators,
                        }
                    ]
                },
                timeData:{
                    labels:dates,
                    datasets: [
                        {
                            label: 'Average Block Time',
                            fill: false,
                            lineTension: 0,
                            yAxisID: 'Time',
                            pointRadius: 1,
                            borderColor: fetchColor11,
                            borderJoinStyle: 'round',
                            backgroundColor: fetchColor01,
                            data: blockTime,
                            tooltips: {
                                callbacks: {
                                    label: function(tooltipItem, data) {
                                        var label = data.datasets[tooltipItem.datasetIndex].label || '';

                                        if (label) {
                                            label += ': ';
                                        }
                                        label += tooltipItem.yLabel+'s';
                                        return label;
                                    }
                                }
                            }
                        },
                        {
                            label: 'Block Interval',
                            fill: false,
                            lineTension: 0,
                            yAxisID: 'Time',
                            pointRadius: 1,
                            borderColor: fetchColor12,
                            borderJoinStyle: 'round',
                            backgroundColor: fetchColor02,
                            data: timeDiff,
                            tooltips: {
                                callbacks: {
                                    label: function(tooltipItem, data) {
                                        var label = data.datasets[tooltipItem.datasetIndex].label || '';

                                        if (label) {
                                            label += ': ';
                                        }
                                        label += tooltipItem.yLabel+'s';
                                        return label;
                                    }
                                }
                            }
                        },
                        {
                            label: 'No. of Validators',
                            fill: false,
                            lineTension: 0,
                            yAxisID: 'Validators',
                            pointRadius: 1,
                            borderColor: fetchColor13,
                            borderJoinStyle: 'round',
                            backgroundColor: fetchColor03,
                            data: validators
                        }
                    ]
                },
                optionsVP: {
                    scales: {
                        xAxes: [
                            {
                                display: false,
                            }
                        ],
                        yAxes: [{
                            id: 'VotingPower',
                            type: 'linear',
                            position: 'left',
                            ticks: {
                                stepSize: 1
                            }
                        }, {
                            id: 'Validators',
                            type: 'linear',
                            position: 'right',
                            ticks: {
                                stepSize: 1
                            }
                        }]
                    }
                },
                optionsTime: {
                    scales: {
                        xAxes: [
                            {
                                display: false,
                            }
                        ],
                        yAxes: [{
                            id: 'Validators',
                            type: 'linear',
                            position: 'right',
                            ticks: {
                                stepSize: 1
                            }
                        }, {
                            id: 'Time',
                            type: 'linear',
                            position: 'left',
                            ticks: {
                            // Include a dollar sign in the ticks
                                callback: function(value, index, values) {
                                    return value+'s';
                                }
                            }
                        }]
                    }
                }
            })
        }
    }

    render(){
        if (this.props.loading){
            return <Spinner type="grow" color="primary" />
        }
        else{
            if (this.props.historyExist && (this.props.history.length > 0)){
                return (
                    <div>
                        <Card>
                            <div className="card-header"><T>analytics.blockTimeHistory</T></div>
                            <CardBody>
                                <SentryBoundary><Line data={this.state.timeData} options={this.state.optionsTime}/></SentryBoundary>
                            </CardBody>
                        </Card>
                        {/* <Card>
                        <div className="card-header">Voting Power History</div>
                        <CardBody>
                        <Line data={this.state.vpData}  options={this.state.optionsVP}/>
                        </CardBody>
                    </Card> */}
                    </div>
                );
            }
            else{
                return <div></div>
            }
        }
    }
}
