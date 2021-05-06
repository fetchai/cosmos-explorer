import '/imports/startup/client';
import '/imports/ui/stylesheets/pace-theme.css';
import '/imports/ui/stylesheets/flipclock.css';
import '/node_modules/plottable/plottable.css';
import './styles.scss';
import React from 'react';
import App from '/imports/ui/App.jsx';
import { BrowserRouter as Router } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
// import ReactDOM from 'react-dom';

CURRENTUSERADDR = 'ledgerUserAddress';
CURRENTUSERPUBKEY = 'ledgerUserPubKey';
BLELEDGERCONNECTION = 'ledgerBLEConnection'

// import { onPageLoad } from 'meteor/server-render';

Meteor.startup(() => {
  render(<Router>
    <App />
  </Router>, document.getElementById('app'));
});
