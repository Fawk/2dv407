/** @jsx React.DOM */

var React = require('react');
var Firebase = require("firebase");
var ReactFireMixin = require('reactfire');

var Message = React.createClass({displayName: 'Message',
	render: function() {
		return (<div>{this.props.value}</div>);
	}
}); 

var CarList = React.createClass({
  render: function() {
		var createItem = function(i, k) {
			return <li key={ k }>{ i.name }<a href='#' onClick={ this.props.crud.removeCar(k) }>{ "Ta bort" }</a></li>;
		};
		if(this.props.items !== undefined) {
			return <ul>{ this.props.items.map(createItem) }</ul>;
		} else {
			return <ul>{ "Det fanns inga bilar!" }</ul>;
		}
	}
});

var CarCRUD = React.createClass({displayName: 'CarCRUD',
	
	mixins: [ReactFireMixin],
	
	render: function() {
		return (<div>
			<Message value={ "Bilar redo att bokas:" } />
			<CarList items={ this.state.cars } crud={ this } />
			<div>
				<form onSubmit={ this.handleSubmit }>
				  <input onChange={ this.onChange } value={ this.state.text } />
				  <button>{ "Lägg till bil" }</button>
				</form>
			</div>
		</div>);
	},
  
	componentWillMount: function() {
		var fireBaseRef = new Firebase("https://blinding-torch-8626.firebaseio.com/cars");
		this.bindAsArray(fireBaseRef, "cars");
	},
	
	onChange: function(e) {
		this.setState({text: e.target.value});
	},
	
	getInitialState: function() {
		return {items: [], text: ""};
	},
	
	getCar: function(id) {
		return this.state.cars[id];
	},
	
	removeCar: function(e, id) {
		e.preventDefault();
		delete this.firebaseRefs["cars"][id];
	},
	
	handleSubmit: function(e) {
		e.preventDefault();
		if (this.state.text && this.state.text.trim().length !== 0) {
		  this.firebaseRefs["cars"].push({ name: this.state.text, price: 1200 });
		  this.setState({text: ""});
		}
	  },
  
});

module.exports = CarCRUD;