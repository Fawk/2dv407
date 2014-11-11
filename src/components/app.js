/** @jsx React.DOM */

var React = require('react');

var HelloMessage = React.createClass({displayName: 'HelloMessage',
  render: function() {
    return (<div>Hello {this.props.name}</div>);
  }
});

module.exports = HelloMessage;