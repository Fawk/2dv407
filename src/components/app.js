/** @jsx React.DOM */

var React = require('react');
var Firebase = require('firebase');

var Message = React.createClass({displayName: 'Message',
	render: function() {
		return (<div>{this.props.value}</div>);
	}
}); 

var CarList = React.createClass({
  render: function() {
		var that = this;
		var createItem = function(i, k) {
				if(that.state.isUpdating && (i.key == that.state.updateTargetKey)) {
					
					return (<li key={ i.key }>				
								<form onSubmit={ that.props.ucar }>
									<input onChange={ that.props.uname } value={ that.state.updateName } />
									<input onChange={ that.props.uprice } value={ that.state.updatePrice } />
									<button>{ "Ändra bil" }</button>
								</form>
							</li>);
				
				} else {
				
					return (<li key={ i.key }>{ i.val.name }
								<a href='#' onClick={ that.props.del }>{ "Ta bort" }</a>
								<a id={ i.key } href='#' onClick={ that.props.update }>{ "Ändra" }</a>
							</li>);
				}
		};
		if(this.props.items !== undefined && this.props.items.length != 0) {
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
			<CarList items={ this.cars } del={ this.removeCar } update={ this.triggerUpdate } ucar={ this.updateCar } uname={ this.onUpdateNameChange } uprice={ this.onUpdatePriceChange } />
			<div>
				<form onSubmit={ this.addCar }>
				  <input onChange={ this.onNameChange } value={ this.state.name } />
				  <input onChange={ this.onPriceChange } value={ this.state.price } />
				  <button>{ "Lägg till bil" }</button>
				</form>
			</div>
		</div>);
	},
  
	componentWillMount: function() {
		var that = this;
		this.fireBaseRef = new Firebase('https://blinding-torch-8626.firebaseio.com/cars');
		this.fireBaseRef.on('value', function(snapshot) {
			if(snapshot.val() !== null && typeof snapshot.val() === 'object') {
				that.cars = [];
				Object.keys(snapshot.val()).forEach(function(key) {
					that.cars.push({ key: key, val: snapshot.val()[key] });
				});
			}
			
			that.setState({ cars: this.cars });
			console.log("Loaded");
			console.log(that.cars);
		}).bind(this);
	},
	
	onNameChange: function(e) {
		this.setState({name: e.target.value});
	},
	
	onPriceChange: function(e) {
		this.setState({price: e.target.value});
	},
	
	onUpdateNameChange: function(e) {
		this.setState({updateName: e.target.value});
	},
	
	onUpdatePriceChange: function(e) {
		this.setState({updatePrice: e.target.value});
	},
	
	
	getInitialState: function() {
		return {cars: [], name: "", price: 0, updateName: "", updatePrice: 0, isUpdating: false, updateTargetKey: 0};
	},
	
	getCar: function(id) {
		return this.state.cars[id];
	},
	
	removeCar: function(e) {
		
		e.preventDefault();
		this.fireBaseRef.child(id).remove();
		for(var i in this.cars) {
			if(this.cars[i].key == id) {
				delete this.cars[i];
				break;
			}	
		}

		this.setState({ cars: this.cars });
		console.log("removeCar");
		console.log(this.cars);
	},
	
	addCar: function(e) {
	
		e.preventDefault();
		if ((this.state.name && this.state.name.trim().length !== 0) && (this.state.price && this.state.price.trim().length !== 0)) {
			this.fireBaseRef.push({ name: this.state.name, price: this.state.price, booked: false });
			this.setState({text: "",price:0});
			console.log("addCar");
			console.log(this.cars);
		}
    },
	
	triggerUpdate: function(e) {
		this.setState({ isUpdating: true, updateTargetKey: e.target.id });
	},
	
	updateCar: function(id) {
		
		if ((this.state.updateName && this.state.updateName.trim().length !== 0) && (this.state.updatePrice && this.state.updatePrice.trim().length !== 0)) {
			this.fireBaseRef.child(id).set({ name: this.state.updateName, price: this.state.updatePrice });
			this.setState({text: "",price:0});
			console.log("updateCar");
			console.log(this.cars);
		}
	}
  
});

module.exports = CarCRUD;