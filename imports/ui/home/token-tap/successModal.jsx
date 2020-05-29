import React, {Component} from "react";
import Modal from "react-bootstrap/Modal";
import * as PropTypes from "prop-types";

/**
 * this modal is shown when token tap has successfully added funds to an account
 */

export class SuccessModal extends Component {
    render() {
        return <Modal animation={false} style={{opacity: 1}} show={this.props.show} onHide={this.props.onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Funds Successfully Added</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>100 Fet added to {this.props.address}</p>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={this.props.onHide}>
                    Close
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