/** @jsx React.DOM */

var React = require('react/addons');
var _ = require('underscore');
var SearchResult = require('./searchresult.js');

var Search = React.createClass({ displayName: 'Search',

	stopSearch: false,
	errors: {},
	template: {},
	searchResult: {},
	data: {},
	options: {}, 
	numberStates: [   
		{ character: "&rarr;", name: "range" },
		{ character: "&gt;", name: "less" },
		{ character: "&lt;", name: "more" }
	],
	forms: [],
	mixins: [React.addons.LinkedStateMixin],
	
	render: function() {
		
		this.generate();

		var mapFunc = function(value, key) {
		
			var error = key.split("_")[0] in this.errors ? this.errors[key.split("_")[0]] : "";

			switch(this.props.template[key].type) {
			
				case "number":
					return (
							<div className="search_field">
								{ this.props.template[key].name + ": "}
								<input key={ key + "_search_from" } placeholder={ "Ex: < 1000, > 1000, 1000->2000" } ref={ key + "_search_from" } className="from" type="text" valueLink={ this.linkState(key + "_search_from") } />
								<span className="error">{ error }</span>
							</div>
						);
					
				case "string":
					return (
						<div className="search_field">
							{ this.props.template[key].name + ": " }
							<input key={ key + "_search" } type='text' className='string' size='10' ref={ key + "_search" } valueLink={ this.linkState(key + "_search") } />
							<span className="error">{ error }</span>
						</div>
					);
					
				case "boolean":
					return (
						<div className="search_field">
							<label htmlFor={ key + "_search" } />
							<input key={ key + "_search" } ref={ key + "_search" } id={ key + "_search" } type='checkbox' className='boolean' checkedLink={ this.linkState(key + "_search") } />
							{ this.props.template[key].name } 
						</div>
					);
			}
		}.bind(this);
		
		return (
			<div className='search'>
				<SearchResult result={ this.state.searchResult } crud={ this.props.crud } />
				<form id={ "searchForm" } onSubmit={ this.handleSubmit }>
					{ _.map(this.options, mapFunc) }
					<button className="btn btn-primary">{ "Sök" }</button>
				</form>
			</div>
		);
	
	}, 
	
	componentWillMount: function() {
		this.data = {};

	},
	
	componentDidMount: function() {

	},
	
	handleSubmit: function(e) {
		
		e.preventDefault();
		
		this.errors = {};
		this.searchResult = { hits: 0, data: [] };
		
		var then = new Date().getTime();
		console.log("Search initiated");

		_.each(this.props.data, function(v) {
			var matchResult = this.matchesSearch(v);
			if(matchResult.isMatch && !this.stopSearch) {
				var obj = { 
					matchedTowards: matchResult.matchedTowards,
					match: v
				};
				this.searchResult.data.push(obj);
				this.searchResult.hits++;
			}
		}, this);
		
		console.log(this.searchResult);
		
		this.setState({ searchResult: this.searchResult });
		
		var now = new Date().getTime();
		console.log("Search result generated in: " + (now - then) + "ms");
	},
	
	matchesSearch: function(obj) {
		
		this.stopSearch = false;
		this.errors = {};
		var result = { isMatch: false };
		var numRanges = {};
		var values = {};
		var newState = {};
		var goal = 0;
		
		_.each(this.state, function(value, key) {
			
			if(key.indexOf("search") !== -1 && value !== "" ) {

				var rk = key.split("_")[0];
				
				if(rk in this.props.template) {
				
					switch(this.props.template[rk].type) {

						case "number":
							
							if(!(rk in numRanges)) {
								numRanges[rk] = {};
							}

							var expr = this.refs[key].getDOMNode().value;
							expr = expr.trim();

							goal += this.searchLogic(rk, expr, numRanges);			

						break;
							
						default: 
							values[rk] = value;
							goal++;
					}
				
				}
				newState[key] = "";
			}
			
		}, this);

		var s = 0;
		var o = {};
		
		_.each(obj.val, function(val, key) {
			
			if(this.props.template[key].type === "number") {

				_.each(numRanges, function(v, k) {
				
					var n = parseInt(val);
					if(v.less) {
						if(n < v.from && k === key) {
							s++;
							o[key] = n + " < " + v.from + " == true";
						}
					} else if(v.more) {
						if(n > v.from && k === key) {
							s++;
							o[key] = n + " > " + v.from + " == true";
						}
					} else {
						if((n <= v.to && n >= v.from) && k === key) {
							s+=2;
							o[key] = v.from + " >= " + n + " <= " + v.to + " == true";
						}
					}
				}, this);
			
			} else {
				
				if(key in values) {
				
					_.each(values, function(v, k) {
					
						if(this.props.template[k].type === "boolean") {
							if(v) {
								o[k] = k + " is true";
								s++;
							}
						} else {
							if(val.indexOf(v) !== -1) {
								o[k] = v + " contained in " + val + " == true";
								s++;
							}
						}
					}, this);
				
				}
			
			}
			
		}, this);

		result.matchedTowards = o;		
		if(s === goal) {
			result.isMatch = true;
		}
		return result;
	},
	
	searchLogic: function(rk, v, numRanges) {
		
		var g = 0, r = [], f = 0, t = 0;
		var less = v.indexOf("<");
		var more = v.indexOf(">");
		var range = v.indexOf("->");

		if(range === -1 && less === -1 && more === -1) {
			this.stopSearchWithError(rk, "Felaktig söksträng!");
			return {};											
		}
		
		if(range !== -1) {	
			
			r = v.split("->");

			try {
				f = parseInt(r[0]);
				t = parseInt(r[1]);
			} catch(err) {
				this.stopSearchWithError(rk, "Inte giltigt nummerformat!");
				return {};
			}
			
			if(f > t) {
				this.stopSearchWithError(rk, "Till kan inte vara lägre än från!");
				return {};
			}
			
			numRanges[rk] = { "range": true, "from": f, "to": t };
			g+=2;
			
		} else if(less !== -1 || more !== -1) {
			
			if(less !== -1) {
				r = v.split("<");
			} else if(more !== -1) {
				r = v.split(">");
			}
			
			try {
				f = parseInt(r[1]);
			} catch(err) {
				this.stopSearchWithError(rk, "Inte giltigt nummerformat!");
				return {};
			}
			
			if(less !== -1) {
				numRanges[rk] = { "less": true, "from": f };
			} else if(more !== -1) {
				numRanges[rk] = { "more": true, "from": f };
			}
			g++;
			
		} else {
			if(range !== -1 && (less !== -1 || more !== -1)) {
				this.stopSearchWithError(rk, "Inte giltigt nummerformat!");
				return {};
			}
		}
		
		return g;
	},
	
	stopSearchWithError: function(key, msg) {
		this.stopSearch = true;
		this.errors[key] = msg;
		this.setState({ hasError: true });
	},
	
	getInitialState: function() {
		return { forms: [] };
	},
	
	generate: function() {
		
		var options = {};

		_.each(this.props.data, function(v) {
		
			_.each(this.props.template, function(pv, pk) {
			
				var obj = {};
				if(pk in options) {
					obj = options[pk];
					if(this.props.template[pk].type === "number") {
						if(obj.highest < parseInt(v.val[pk])) {
							obj.highest = parseInt(v.val[pk]);
						} else if (obj.lowest > parseInt(v.val[pk])) {
							obj.lowest = parseInt(v.val[pk]);   
						}
					}
				} else {
					if(this.props.template[pk].type === "number") {
						obj.highest = parseInt(v.val[pk]);
						obj.lowest = parseInt(v.val[pk]);
					} 
					obj.type = this.props.template[pk].type;
					options[pk] = obj;
				}
				
			}, this);
			
		}, this);
	
		this.options = options;
	}
	
});

module.exports = Search;
