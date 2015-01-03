/** @jsx React.DOM */

var React = require('react/addons');
var _ = require('underscore');

var VehicleList = React.createClass({
	
	getInitialState: function() {
		return { ex: "" }
	},

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
					
					var ex = this.state[i.key + "_extended"] ? _.map(i.val, extending) : "";
				
					return (
								<li data-status="closed" className="list-group-item" key={ i.key }>
									<a href='#' onClick={ function(e) { c.removeObject(e, i.key); } }>{ "Ta bort" }</a>
									<a id={ i.key } className="triggerUpdate" href='#' onClick={ function(e) { c.triggerUpdate(e, i.val); } }>{ "Ändra" }</a>
									<span className="trigger" onClick={ function() { this.setExtended(i.key); }.bind(this) }>{ i.val.name }</span>
									<div className="extended">
										{ ex }
									</div>
								</li>
							);
				}
		}.bind(this);
		
		if(c.vehicles !== undefined && c.vehicles.length !== 0) {
			return <ul className="list-group" id="listr">{ c.vehicles.map(createItem) }</ul>;
		} else {
			return <ul>{ "Det fanns inga bilar att boka!" }</ul>;
		}
	},
	
	setExtended: function(key) {
		var obj = {};
		obj[key + "_extended"] = true;
		if(this.state[key + "_extended"]) {
			obj[key + "_extended"] = false;
		}
		this.setState(obj);
	}
});

module.exports = VehicleList;