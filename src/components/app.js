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
		console.log(firebaseRef);
		this.bindAsArray(firebaseRef.limitToLast(25), "test");
	},
	
	onChange: function(e) {
		this.setState({text: e.target.value});
	},
	
});

module.exports = FireBaseTest;