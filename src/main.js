/** @jsx React.DOM */

var HelloMessage = require('./components/app'),
    React = require('react');

React.renderComponent(
  <HelloMessage name="john" />,
  document.getElementById('main'));
  

 