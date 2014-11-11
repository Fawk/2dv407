var React = require('react');

var HelloMessage = React.createClass({displayName: 'HelloMessage',
  render: function() {
    return React.createElement("div", null, "Hello ", this.props.name);
  }
});

React.renderComponent(HelloMessage("John"), document.getElementById("content"));