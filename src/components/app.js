/** @jsx React.DOM */

var React = require('react/addons');
var Firebase = require('firebase');
var Search = require('./search.js');
var _ = require('underscore');
var Booking = require('./booking.js');

var VehicleList = React.createClass({
  render: function() {
  		var c = this.props.crud;
		var state = c.state;
		
		var updating = function(value, key) {
			
			if(c.template[key].type === "number" || c.template[key].type === "string") {
				var type = c.template[key].type === "number" ? "number" : "text";
				return (
					<div>
						<span>{ c.template[key].name + ":" }</span>
						<input key={ key + c.template[key].name + "_update" } type={ type } ref={ key } valueLink={ c.linkState(key + "_update") } className="form-control" />
					</div>
				);
			} else {
				return (
					<div>
						<label htmlFor={ key + c.template[key].name + "_update" }>
							<input id={ key + c.template[key].name + "_update" } key={ key + c.template[key].name + "_update" } type='checkbox' className='boolean' checkedLink={ c.linkState(key + "_update") }  />
							{ c.template[key].name }
						</label>
					</div>
				);
			}
		};
		
		var extending = function(value, key) {
			var v = typeof value === "boolean" ? value === true ? "Ja" : "Nej" : value;
			return <div><span><b>{ c.template[key].name }</b>{ ": " + v }</span></div>;
		};

		var createItem = function(i) {
		
				if(!c.matchesTemplate(i.val)) {
					return <li key={ i.key }>{ "Datan på detta objekt är av felaktigt tema!" }</li>;
				}
		
				if(state.isUpdating && (i.key === state.updateTargetKey)) {
					
					return (
								<li className="list-group-item" key={ i.key }>				
									<form id={ "updateForm" } onSubmit={ function(e) { c.updateWithTemplate(e, i.key); } }>
										{ _.map(i.val, updating) }
										<button className="btn btn-danger" type='button' onClick={ c.stopUpdating }>{ "Avbryt" }</button>
										<button className="btn btn-primary">{ "Ändra bil" }</button>
									</form>
								</li>
							);
				
				} else {
				
					return (
								<li data-status="closed" className="list-group-item" key={ i.key }>
									<a href='#' onClick={ function(e) { c.removeObject(e, i.key); } }>{ "Ta bort" }</a>
									<a id={ i.key } className="triggerUpdate" href='#' onClick={ function(e) { c.triggerUpdate(e, i.val); } }>{ "Ändra" }</a>
									<span className="trigger">{ i.val.name }</span>
									<div className="extended">
										{ _.map(i.val, extending) }
									</div>
								</li>
							);
				}
		};
		if(c.vehicles !== undefined && c.vehicles.length != 0) {
			return <ul className="list-group" id="listr">{ c.vehicles.map(createItem) }</ul>;
		} else {
			return <ul>{ "Det fanns inga bilar att boka!" }</ul>;
		}
	}
});

var VehicleCRUD = React.createClass({displayName: 'VehicleCRUD',

	fireBaseRef: null,
	template: {},
	vehicles: [],
	forms: [],
	bookingObj: {},
	mixins: [React.addons.LinkedStateMixin],

	render: function() {
	
		var createItem = function(value, key) {
			if(value.type === "boolean") {
				return (
					<div>
						<label htmlFor="c1" key={ key + "_label" }>
							<input type="checkbox" id="c1" name="cc" key={ key + "_checkbox" } checkedLink={ this.linkState(key) } />
							{ value.name }
						</label>
					</div>
				);
			} else {
				var t = value.type === "number" ? "number" : "text";
				return (
					<div>
						<input required key={ key + "_input" } type={ t } valueLink={ this.linkState(key) } placeholder={ value.name } className="form-control" />
					</div>
				);
			}
		}.bind(this);
	
		return (<div>
			<div className="addContainer">
				<div className="title">Lägg till ny</div>
				<div className="scroll">
					<VehicleList crud={ this } />
				</div>
				<form onSubmit={ this.addWithTemplate } id={ "addForm" }>
				  { _.map(this.template, createItem) }
				  <button className="btn btn-primary">{ "Lägg till bil" }</button>
				</form>
			</div>
			<div className="searchContainer">
				<div className="title">Sökning</div>
				<Search data={ this.vehicles } template={ this.template } crud={ this } />
			</div>
			<div className="bookingContainer">
				<div className="title">Bokning</div>
				<Booking obj={ this.bookedObj } template={ this.template } baseRef={ this.fireBaseRef } crud={ this } />
			</div>
		</div>);
	},
  
	componentWillMount: function() {
	
		var templateRef = new Firebase('https://blinding-torch-8626.firebaseio.com/templates/standard');
		templateRef.on("value", function(snapshot) {
			if(snapshot.val()) {
				this.template = snapshot.val();
			}
		}.bind(this));
		
		this.fireBaseRef = new Firebase('https://blinding-torch-8626.firebaseio.com/vehicles');
		this.fireBaseRef.on("value", function(snapshot) {
		
			if(snapshot.val() !== null && typeof snapshot.val() === 'object') {
				this.vehicles = [];
				_.each(snapshot.val(), function(value, k) {
					this.vehicles.push({ key: k, val: value });
				}, this);
			}
			
			this.setState({ vehicles: this.vehicles });
			console.log("Loaded");
			console.log(this.vehicles);
		}.bind(this));
	},
	
	componentDidMount: function() {
		var self = this;
	
		$("body").on("click", "#listr li .trigger, #listn li .trigger, #listb1 li .trigger, #listb1 li .trigger", function() {
			if(!self.isUpdating) {
				if($(this).parent().attr("data-status") === "closed") {
					$(this).parent().animate({ height: "150px" }, 200, function() {
						$(this).find(".extended").fadeIn("fast");
					});
					$(this).parent().attr("data-status", "open");
				} else { 
					$(this).parent().find(".extended").fadeOut("fast", function() {
						$(this).parent().animate({ height: "42px" }, 200);
					});
					$(this).parent().attr("data-status", "closed");
				}
			}
		});
		
		$("body").on("click", "#listr li .triggerUpdate", function() {
			$(this).parent().css({ height: "auto" });
		});
	},
	
	matchesTemplate: function(obj) {
		Object.keys(obj).forEach(function(key) {
			if(!(key in this.template)) {
				return false;
			}
		}.bind(this));
		return true;
	},
	
	bookObject: function(e, obj) {
		e.preventDefault();
		this.bookedObj = obj;
		this.setState({ bookedObj: this.bookedObj });
	},
	
	unbookObject: function(e, obj) {
		e.preventDefault();
		this.fireBaseRef.push(obj.val);
		this.setState({ fake: !this.state.fake });
	},
	
	stopUpdating: function() {
		this.setState({ isUpdating: false });
	},
	
	getInitialState: function() {
		return {vehicles: [], isUpdating: false, updateTargetKey: 0, fake: false };
	},
	
	getVehicle: function(id) {
		return this.state.vehicles[id];
	},
	
	removeObject: function(e, id) {
		
		e.preventDefault();
		if(confirm("Vill du verkligen ta bort?")) {
		
			this.fireBaseRef.child(id).remove();
			for(var i in this.vehicles) {
				if(this.vehicles[i].key === id) {
					this.vehicles.splice(i, 1);
					break;
				}	
			}

			this.setState({ vehicles: this.vehicles });
			console.log("removeVehicle");
			console.log(this.vehicles);
		
		}
	},
	
	triggerUpdate: function(e, obj) {
		_.each(obj, function(value, key) {
			this.state[key + "_update"] = value;
		}.bind(this));
		this.setState({ isUpdating: true, updateTargetKey: e.target.id });
	},
	
	updateWithTemplate: function(e, id) {
	
		e.preventDefault();
		
		if(!this.checkEmptyTemplateStates()) {
		
			var obj = {};
			_.each(this.template, function(value, key) {
				var k = key + "_update";
				if(value.type === "boolean" && !this.state[k]) {
					obj[key] = false;
				} else {
					obj[key] = this.state[k];
				}
			}, this);
			
			this.resetState();
			
			this.fireBaseRef.child(id).set(obj);
			this.setState({ isUpdating: false, updateTargetKey: 0 });
			console.log("updateVehicle");
			console.log(this.vehicles);
		}
		
	},
	
	addWithTemplate: function(e) {
	
		e.preventDefault();
		if (!this.checkEmptyTemplateStates()) {
			
			var obj = {};
			_.each(this.template, function(value, key) {
				if(value.type === "boolean" && !this.state[key]) {
					obj[key] = false;
				} else {
					obj[key] = this.state[key];
				}
			}, this);
			this.fireBaseRef.push(obj);
			this.resetState();
			
			console.log("addVehicle");
			console.log(this.vehicles);
		}
	},
	
	checkEmptyTemplateStates: function() {

		_.each(this.template, function(obj, key) {
			
			if(this.state.isUpdating) {
				key = key + "_update";
			}
			
			if(this.state[key]) {
				if(obj.type === "string" || obj.type === "number") {
					if(this.state[key].trim().length === 0) {
						return true;
					}
				}
			}
		}, this);
		
		return false;
	},
	
	resetState: function() {

		var o = {};
		_.each(this.template, function(obj, key) {
		
			if(this.state.isUpdating) {
				key = key + "_update";
			}
		
			switch(obj.type) {
				case "string": o[key] = ""; break;
				case "number": o[key] = 0; break;
				case "boolean": o[key] = false; break;
				default: "";
			}
		}, this);
		this.setState(o);
	}

});

module.exports = VehicleCRUD;