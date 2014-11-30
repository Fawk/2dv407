/** @jsx React.DOM */

var React = require('react');
var Firebase = require("firebase");
var ReactFireMixin = require('reactfire');
var _ = require('lodash');

var Message = React.createClass({displayName: 'Message',
	render: function() {
		return (<div>{this.props.value}</div>);
	}
}); 

var Vehicle = React.createClass({
	render: function() {
		return (<li key={ this.props.key }>{ this.props.item }</li>);
	}
});

var VehicleList = React.createClass({
  render: function() {
	return 
	(<div>

	</div>);
	}
});

var VehicleCRUD = React.createClass({displayName: 'VehicleCRUD',
	
	mixins: [ReactFireMixin],
	
	render: function() {
		return 
		(<div>
			<Message value={ "Fordon" } />
			<VehicleList />
			<div>
				<form onSubmit={ this.handleSubmit }>
				  <input onChange={ this.onChange } value={ this.state.text } />
				  <button>{ "Lägg till fordon" }</button>
				</form>
			</div>
		</div>);
	},
  
	componentWillMount: function() {
		var fireBaseRef = new Firebase("https://blinding-torch-8626.firebaseio.com/");
		this.bindAsArray(fireBaseRef, "items");
	},
	
	onChange: function(e) {
		this.setState({text: e.target.value});
	},
	
	getInitialState: function() {
		return {items: [], text: ""};
	},
	
	getVehicle: function(id) {
		return this.state.items[id];
	},
	
	addVehicle: function() {
	
	},
	
	handleSubmit: function(e) {
		e.preventDefault();
		if (this.state.text && this.state.text.trim().length !== 0) {
		  this.firebaseRefs["items"].push(this.state.text);
		  this.setState({text: ""});
		}
	  },
  
});

module.exports = VehicleCRUD;