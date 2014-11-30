/** @jsx React.DOM */

var FireBaseTest = require('./components/app'),
    React = require('react');

React.renderComponent(
  <VehicleCRUD />,
  document.getElementById('main'));