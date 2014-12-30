/** @jsx React.DOM */

var React = require('react/addons');
var _ = require('underscore');

var SearchResult = React.createClass({ displayName: 'SearchResult', 

	render: function() {
	
		var extending = function(value, key) {
			var v = typeof value === "boolean" ? value === true ? "Ja" : "Nej" : value;
			return <div><span><b>{ this.props.crud.template[key].name }</b>{ ": " + v }</span></div>;
		}.bind(this);
	
		var createItem = function(obj, key) {
		
			if(obj.match) {
				return (
					<li data-status="closed" className="list-group-item" key={ obj.match.key }>
						<a id={ obj.match.key } href='#' onClick={ function(e) { this.props.crud.bookObject(e, obj.match) }.bind(this) }>{ "Boka" }</a>
						<span className="trigger">{ obj.match.val.name }</span>
						<div className="extended">
							{ _.map(obj.match.val, extending) }
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
	}
	
});

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
							<div>
								{ this.props.template[key].name }
								<div className="search_options"><span className="f">Från </span>
									<input key={ key + "_search_from" } placeholder={ this.options[key].lowest } ref={ key + "_search_from" } className="from" type="number" min="0" max={ this.options[key].highest+1 } valueLink={ this.linkState(key + "_search_from") } className="from" />
									<div className="action" data-type="0">&nbsp;&rarr;&nbsp;</div>
									<input key={ key + "_search_to" } placeholder={ this.options[key].highest } ref={ key + "_search_to" } type="number" min="0" max={ this.options[key].highest+1 } valueLink={ this.linkState(key + "_search_to") } className="to" />
									<span className="t"> Till</span>
									<span className="error">{ error }</span>
								</div>
							</div>
						);
					
				case "string":
					return (
						<div>
							{ this.props.template[key].name + ": " }
							<input key={ key + "_search" } type='text' className='string' size='10' ref={ key + "_search" } valueLink={ this.linkState(key + "_search") } />
							<span className="error">{ error }</span>
						</div>
					);
					
				case "boolean":
					return (
						<div>
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

		var self = this;
		$("body").on("click", ".action", function(e) {
			var i = parseInt($(this).attr("data-type"));
			i++;
			if(i == self.numberStates.length) {
				i = 0;
			}
			if(i == 1 || i == 2) {
				$(this).parent().find(".to").hide();
				if(i == 1) {
					$(this).parent().find(".f").text("Mindre än ");
				} else {
					$(this).parent().find(".f").text("Större än ");
				}
				$(this).parent().find(".t").text("");
			} else {
				$(this).parent().find(".to").show();
				$(this).parent().find(".f").text("Från ");
				$(this).parent().find(".t").text(" Till");
			}
			$(this).attr("data-type", i);
			self.setType($(this), i);
		});
	},
	
	setType: function(el, index) {
		el.html("&nbsp;" + this.numberStates[index].character + "&nbsp;");
	},
	
	handleSubmit: function(e) {
		
		e.preventDefault();
		
		this.errors = {};
		this.searchResult = { hits: 0, data: [] };
		
		var then = new Date().getTime();
		console.log("Search initiated");

		_.each(this.props.data, function(v, k) {
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
							var fk = key.split("_")[2];
							
							var jnode = $(this.refs[key].getDOMNode());
							
							var tk = key.substr(0, (key.length-4)) + "to";
							
							if(!(rk in numRanges)) {
								numRanges[rk] = {};
							}
							
							if(fk == "from" && !(tk in this.state)) {
							
								numRanges[rk][this.numberStates[parseInt(jnode.parent().find(".action").attr("data-type"))].name] = true;
								numRanges[rk][fk] = parseInt(value);
								goal++;
								
							} else {

								if(fk == "to" && (parseInt(value) < numRanges[rk].from)) {
									this.stopSearch = true;
									this.errors[rk] = "Till kan inte vara lägre än från!";
									this.setState({ hasError: true });
									return {};
								}
								
								numRanges[rk][fk] = parseInt(value);
								goal++;					
							}

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
				
					var n = parseInt(val)
					if(v.less) {
						if(n < v.from && k == key) {
							s++;
							o[key] = n + " < " + v.from + " == true";
						}
					} else if(v.more) {
						if(n > v.from && k == key) {
							s++;
							o[key] = n + " > " + v.from + " == true";
						}
					} else {
						if((n <= v.to && n >= v.from) && k == key) {
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
		if(s == goal) result.isMatch = true;
		return result;
	},
	
	getInitialState: function() {
		return { forms: [] };
	},
	
	generate: function() {
		
		var options = {};

		_.each(this.props.data, function(v, k) {
		
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
