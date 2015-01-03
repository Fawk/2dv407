/** @jsx React.DOM */

var React = require('react/addons');
var _ = require('underscore');

var SearchResult = React.createClass({ displayName: 'SearchResult', 
	
	getInitialState: function() {
		return { ex: "" };
	},

	render: function() {
	
		var extending = function(value, key) {
			var v = typeof value === "boolean" ? value === true ? "Ja" : "Nej" : value;
			return <div><span><b>{ this.props.crud.template[key].name }</b>{ ": " + v }</span></div>;
		}.bind(this);
	
		var createItem = function(obj) {
			
			var ex = this.state[obj.match.key + "_search_extended"] ? _.map(obj.match.val, extending) : "";
		
			if(obj.match) {
				return (
					<li data-status="closed" className="list-group-item" key={ obj.match.key }>
						<a id={ obj.match.key } href='#' onClick={ function(e) { this.props.crud.bookObject(e, obj.match); }.bind(this) }>{ "Boka" }</a>
						<span className="trigger" onClick={ function() { this.setExtended(obj.match.key); }.bind(this) }>{ obj.match.val.name }</span>
						<div className="extended">
							{ ex }
						</div>
					</li>
				);
			}
		}.bind(this);
		
		if(this.props.result) {
		
			return (
				<div className="scroll">
					<span className="hits">{ this.props.result.hits + " träffar!" }</span>
					<ul className="list-group" id="listn">
						{ _.map(this.props.result.data, createItem) }
					</ul>
				</div>
			);
		
		} else {
			return null;
		}
	},
	
	setExtended: function(key) {
		var obj = {};

		obj[key + "_search_extended"] = true;
		if(this.state[key + "_search_extended"]) {
			obj[key + "_search_extended"] = false;
		}
		this.setState(obj);
	}
	
});

module.exports = SearchResult;