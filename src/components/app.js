var React = require('react');

var CommentBox = React.createClass({displayName: 'CommentBox',
  render: function() {
    return (
      <div className='commentBox'>
		This is a CommentBox!
	  </div>
    );
  }
});
React.renderComponent(
  <CommentBox />,
  document.getElementById('content')
);

module.exports = CommentBox;