/** @jsx React.DOM */
/* global $ */

var React = require('react/addons');
var Firebase = require('firebase');
var Search = require('./search.js');
var _ = require('underscore');
var Booking = require('./booking.js');
var VehicleList = require('./vehiclelist.js');

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
	
		/*$("body").on("click", "#listr li .trigger, #listn li .trigger, #listb1 li .trigger, #listb1 li .trigger", function() {
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
		});*/
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
			}
		}, this);
		this.setState(o);
	}

});

module.exports = VehicleCRUD;