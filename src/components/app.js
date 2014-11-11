/** @jsx React.DOM */

var React = require('react');
var Firebase = require("firebase");
var ReactFireMixin = require('reactfire');

var Message = React.createClass({displayName: 'Message',
	render: function() {
		return (<div>{this.props.value}</div>);
	}
}); 

var FireBaseTest = React.createClass({displayName: 'FireBaseTest',
	
	mixins: [ReactFireMixin],
	
	render: function() {
		return (<Message value={ this.state.test } />);
	},
  
	componentWillMount: function() {
		var firebaseRef = new Firebase("https://blinding-torch-8626.firebaseio.com/test/");
		this.commentsRef.on('child_added', function(snapshot) {
            this.comments.push(snapshot.val());
            this.setState({data: this.comments});
          }.bind(this));
	},
	
	onChange: function(e) {
		this.setState({data: e.target.value});
	},
	
	getInitialState: function() {
		this.comments = [];
		return {data: []};
	}
	
});

module.exports = FireBaseTest;