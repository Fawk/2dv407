var React = require('react');

var HelloMessage = React.createClass({displayName: 'HelloMessage',
  render: function() {
    return (<div>Hello {this.props.name}</div>);
  }
});

React.renderComponent(<HelloMessage name="John" />, document.getElementById("content"));

module.exports = HelloMessage;