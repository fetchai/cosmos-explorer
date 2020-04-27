import React, { Component } from 'react';
// another small block render
import { Col, Row, Spinner } from 'reactstrap';
import i18n from 'meteor/universe:i18n';
import Block from './block.js';

const T = i18n.createComponent();
export default class Blocks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blocks: '',
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.blocks != prevProps.blocks) {
      if (this.props.blocks.length > 0) {
        const blocks = this.props.blocks.map((block) => (<Block key={block.height} hash={block.hash} block={block} />));
        this.setState(
          { blocks },
        );
      }
    }
  }

  render() {
    if (this.props.loading) {
      return (
        <Row>
          <Col>
            <Spinner type="grow" color="primary" />
          </Col>
        </Row>
      );
    }
    if (this.props.blocks.length > 0) {
      return this.state.blocks;
    }

    return (
      <Row>
        <Col>
          <T>blocks.noBlock</T>
        </Col>
      </Row>
    );
  }
}
