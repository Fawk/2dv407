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
		return (<Message value={ this.state.items[0] } />);
	},
  
	componentWillMount: function() {
		var fireBaseRef = new Firebase("https://blinding-torch-8626.firebaseio.com/test/");
		this.bindAsArray(fireBaseRef, "items");
	},
	
	onChange: function(e) {
		this.setState({data: e.target.value});
	},
	
	getInitialState: function() {
		return {items: []};
	}
	
});

module.exports = FireBaseTest;