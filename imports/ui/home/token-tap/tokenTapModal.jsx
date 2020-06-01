import React, {Component} from "react";
import Modal from "react-bootstrap/Modal";
import * as PropTypes from "prop-types";
import i18n from 'meteor/universe:i18n';


const T = i18n.createComponent();

/**
 * first modal to (of two) in token tap dialog
 */
export class TokenTapModal extends Component {


    render() {
        return <Modal animation={false} style={{opacity: 1}} show={this.props.show}
                      onHide={this.props.hide}>
            <Modal.Header closeButton>
                <Modal.Title><T>common.tokenTapModalTitle</T></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form id="form">
                        <span>Address </span>
                        <input id="pending_address_name" className="modal-form-input" name="pending_address_name"
                               type="text"
                               value={this.props.value}
                               onChange={this.props.onChange}/>
                        <br></br><span className="modal_error"> {this.props.error}</span>
                        {this.props.success ? <span className=""><T>common.success</T></span> : ""}
                </form>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={this.props.onClick}>
                    <T>common.tokenTapModalButton</T>
                </button>
            </Modal.Footer>
        </Modal>
    }
}

TokenTapModal.propTypes = {
    show: PropTypes.any,
    hide: PropTypes.any,
    value: PropTypes.any,
    onChange: PropTypes.func,
    error: PropTypes.any,
    success: PropTypes.any,
    onClick: PropTypes.func
};