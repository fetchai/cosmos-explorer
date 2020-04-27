import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';

export default class TimeAgo extends Component {
  constructor(props) {
    super(props);

    moment.relativeTimeThreshold('s', 60);
    moment.relativeTimeThreshold('ss', 3);

    this.state = {
      timer: 0,
      time: moment(props.time).fromNow(),
    };
  }

  componentDidMount() {
    const self = this;
    this.state.timer = Meteor.setInterval(() => {
      const now = moment();
      const blockTime = moment(self.props.time);
      const duration = moment.duration(blockTime.diff(now));
      const seconds = Math.floor(duration.asSeconds());
      if (seconds > 60) {
        Meteor.clearInterval(self.state.timer);
      } else {
        self.setState({
          time: moment(self.props.time).fromNow(),
        });
      }
    }, 1000);
  }

  componentWillUnmount() {
    Meteor.clearInterval(this.state.timer);
  }

  render() {
    return (
      <small>
        {this.state.time}
      </small>
    );
  }
}
