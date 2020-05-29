import React, {Component} from "react";
import Modal from "react-bootstrap/Modal";
import * as PropTypes from "prop-types";
import i18n from 'meteor/universe:i18n';


const T = i18n.createComponent();

/**
 * first modal to access token tap
 */
export class TokenTapModal extends Component {


    render() {
        return <Modal animation={false} style={{opacity: 1}} show={this.props.show}
                      onHide={this.props.modalState.bind(null, false)}>
            <Modal.Header closeButton>
                <Modal.Title>Add funds to Fetch Account</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form id="form">
                    <p>
                        <span>Address </span>
                        <input id="pending_address_name" className="modal-form-input" name="pending_address_name"
                               type="text"
                               value={this.props.value}
                               onChange={this.props.onChange}/>
                        <br></br><span className="modal_error"> {this.props.error}</span>
                        {this.props.success ? <span className=""><T>common.success</T></span> : ""}
                    </p>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={this.props.onClick}>
                    Add Funds
                </button>
            </Modal.Footer>
        </Modal>;
    }
}

TokenTapModal.propTypes = {
    show: PropTypes.any,
    modalState: PropTypes.any,
    value: PropTypes.any,
    onChange: PropTypes.func,
    error: PropTypes.any,
    success: PropTypes.any,
    onClick: PropTypes.func
};