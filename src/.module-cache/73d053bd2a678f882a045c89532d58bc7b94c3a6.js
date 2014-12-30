/** @jsx React.DOM */

var VehicleCRUD = require('./components/app'),
    React = require('react');

React.renderComponent(
  <VehicleCRUD />,
  document.getElementById('main'));