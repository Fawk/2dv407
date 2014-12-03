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
		var that = this;
		var createItem = function(i, k) {
			return <li key={ k }>{ i.name }<a href='#' onClick={ function(e) { that.props.func(e, i); } }>{ "Ta bort" }</a></li>;
		};
		if(this.props.items !== undefined) {
			return <ul>{ this.props.items.map(createItem) }</ul>;
		} else {
			return <ul>{ "Det fanns inga bilar!" }</ul>;
		}
	}
});

var CarCRUD = React.createClass({displayName: 'CarCRUD',

	firebaseRef: null,

	render: function() {
		return (<div>
			<Message value={ "Bilar redo att bokas:" } />
			<CarList items={ this.state.cars } func={ this.removeCar } />
			<div>
				<form onSubmit={ this.handleSubmit }>
				  <input onChange={ this.onChange } value={ this.state.text } />
				  <button>{ "Lägg till bil" }</button>
				</form>
			</div>
		</div>);
	},
  
	componentWillMount: function() {
		this.fireBaseRef = new Firebase("https://blinding-torch-8626.firebaseio.com/cars");
		his.setState({ cars: [] });
		this.fireBaseRef.on("value", function(snapshot) {
			this.state.cars[snapshot.key()] = snapshot.val();
		});
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
	
		console.log(id);
		console.log(this.firebaseRef);
	
		e.preventDefault();
		var ref = new Firebase("https://blinding-torch-8626.firebaseio.com/cars/" + id);
		ref.remove();
	},
	
	handleSubmit: function(e) {
		e.preventDefault();
		if (this.state.text && this.state.text.trim().length !== 0) {
		  this.firebaseRefs.push({ name: this.state.text, price: 1200 });
		  this.setState({text: ""});
		}
	  },
  
});

module.exports = CarCRUD;