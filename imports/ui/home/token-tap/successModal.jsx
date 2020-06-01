import React, {Component} from "react";
import Modal from "react-bootstrap/Modal";
import * as PropTypes from "prop-types";

import i18n from 'meteor/universe:i18n';

const T = i18n.createComponent();

/**
 * this modal is shown when token tap has successfully added funds to an account
 */

export class SuccessModal extends Component {
    render() {
        return <Modal animation={false} style={{opacity: 1}} show={this.props.show} onHide={this.props.onHide}>
            <Modal.Header closeButton>
                <Modal.Title><T>common.successModalTitle</T></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><T>common.successModalBody</T>{this.props.address}</p>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={this.props.onHide}>
                    <T>common.successModalClose</T>
                </button>
            </Modal.Footer>
        </Modal>;
    }
}


SuccessModal.propTypes = {
    show: PropTypes.any,
    onHide: PropTypes.func,
    address: PropTypes.any
};