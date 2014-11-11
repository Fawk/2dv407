var React = require('react');

var CommentBox = React.createClass({displayName: 'CommentBox',
  render: function() {
    return (
      React.createElement(React.DOM.div, {className: "commentBox"}, 
        "Hello, world! I am a CommentBox."
      )
    );
  }
});
React.renderComponent(
  React.createElement(CommentBox, "hej"),
  document.getElementById('content')
);