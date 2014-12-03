/** @jsx React.DOM */

var React = require('react');
var Firebase = require("firebase");

var Message = React.createClass({displayName: 'Message',
	render: function() {
		return (<div>{this.props.value}</div>);
	}
}); 

var CarList = React.createClass({
  render: function() {
		var that = this;
		var createItem = function(i, k) {
			return <li key={ i.key }>{ i.val.name }<a href='#' onClick={ function(e) { that.props.func(e, i.key); } }>{ "Ta bort" }</a></li>;
		};
		if(this.props.items !== undefined) {
			return <ul>{ this.props.items.map(createItem) }</ul>;
		} else {
			return <ul>{ "Det fanns inga bilar!" }</ul>;
		}
	}
});

var CarCRUD = React.createClass({displayName: 'CarCRUD',

	fireBaseRef: null,
	cars: [],

	render: function() {
		return (<div>
			<Message value={ "Bilar redo att bokas:" } />
			<CarList items={ this.cars } func={ this.removeCar } />
			<div>
				<form onSubmit={ this.handleSubmit }>
				  <input onChange={ this.onChange } value={ this.state.text } />
				  <button>{ "Lägg till bil" }</button>
				</form>
			</div>
		</div>);
	},
  
	componentWillMount: function() {
		var that = this;
		this.fireBaseRef = new Firebase('https://blinding-torch-8626.firebaseio.com/cars');
		this.fireBaseRef.on('value', function(snapshot) {
			Object.keys(snapshot.val()).forEach(function(key) {
				that.cars.push({ key: key, val: snapshot.val()[key] });
			});
			
			that.setState({ cars: this.cars });
		}).bind(this);
	},
	
	onChange: function(e) {
		this.setState({text: e.target.value});
	},
	
	getInitialState: function() {
		return {cars: [], text: ""};
	},
	
	getCar: function(id) {
		return this.state.cars[id];
	},
	
	removeCar: function(e, id) {
		
		e.preventDefault();
		this.fireBaseRef.child(id).remove();
		for(var i in this.cars) {
			if(this.cars[i].key == id) {
				delete this.cars[i];
				break;
			}	
		}

		this.setState({ cars: this.cars });
	},
	
	handleSubmit: function(e) {
		e.preventDefault();
		if (this.state.text && this.state.text.trim().length !== 0) {
		  this.fireBaseRef.push({ name: this.state.text, price: 1200 });
		  this.setState({text: ""});
		}
    }
  
});

module.exports = CarCRUD;