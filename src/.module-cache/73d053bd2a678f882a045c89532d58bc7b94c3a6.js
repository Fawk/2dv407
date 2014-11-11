/** @jsx React.DOM */

var HelloMessage = require('./components/app'),
    React = require('react');

React.renderComponent(
  <HelloMessage name="John" />,
  document.getElementById('main'));
  
 module.exports = HelloMessage;