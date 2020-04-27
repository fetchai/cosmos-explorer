import React, { Component } from 'react';

export default class Clock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
    };
  }

  componentDidMount() {
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  tick() {
    // this.state.date = new Date(); - wrong way
    this.setState({ date: new Date() });
  }

  render() {
    const { date } = this.state;
    return (
      <>
        { date.toUTCString() }
      </>
    );
  }
}
