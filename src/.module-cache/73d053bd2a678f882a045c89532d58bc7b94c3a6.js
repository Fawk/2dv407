/** @jsx React.DOM */

var CarCRUD = require('./components/app'),
    React = require('react');

React.renderComponent(
  <CarCRUD />,
  document.getElementById('main'));