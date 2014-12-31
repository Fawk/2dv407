/** @jsx React.DOM */

var Firebase = require('firebase');
var React = require('react/addons');
var _ = require('underscore');

module.exports = React.createClass({ displayName: "BookingClass", 
	
	fireBaseRef: null,
	booked: [],
	mixins: [React.addons.LinkedStateMixin],
	render: function() {

		var bookedList = function(value) {
			
			console.log(value);
		
			return (
				<li data-status="closed" className="list-group-item">
					<a id={ value.val.booked.key } href='#' onClick={ function(e) { this.removeBooked(value.val.booked); this.props.crud.unbookObject(e, value.val.booked); }.bind(this) }>{ "Avboka" }</a>
					<div className="trigger">{ "Bokad av: " + value.val.booker }</div>
					<div className="extended">
						{ _.map(value.val.booked.val, extending) }
					</div>
				</li>
			);
			
		}.bind(this);		
		
		var extending = function(value, key) {
			var v = typeof value === "boolean" ? value === true ? "Ja" : "Nej" : value;
			return <div><span><b>{ this.props.template[key].name }</b>{ ": " + v }</span></div>;
		}.bind(this);
		
		var a = function() { if(_.size(this.booked) > 0) { return _.map(this.booked, bookedList); } else { return "Inget är bokat!"; } }.bind(this)();
		
		if(this.props.obj !== undefined) {
		
			return (
			<div>
				<div className="scroll">
					<div className="hits">Bokade:</div>
					<ul className="list-group">
						{ a }
					</ul>
				</div>
				<div className="booking">
					<div className="smalltitle">Vald för bokning:</div>
					<div className="booktarget">
						<ul className="list-group" id="listb2">
							<li data-status="closed" className="list-group-item" key={ this.props.obj.key }>
								<span className="trigger">{ this.props.obj.val.name }</span>
								<div className="extended">
									{ _.map(this.props.obj.val, extending) }
								</div>
							</li>
						</ul>
					</div>
				</div>
				
				<form onSubmit={ function(e) { this.bookObj(e, this.props.obj); }.bind(this) } id="bookForm">
					<div className="booker_info">
						<span className="smalltitle">{ "Bokningsinfo:" }</span>
						<input placeholder="Namn" key={ "booker_name" } required valueLink={ this.linkState("booker_name") } />
						<input placeholder="Telefonnr" type="tel" key={ "booker_tel" } required valueLink={ this.linkState("booker_tel") } />
					</div>
					<button className="btn btn-primary">Slutför bokning</button>
				</form>
			</div>
			);
		} else {	
		
			return (
				<div>
					<div className="scroll">
						<div className="booked">
							<div className="hits">Bokade:</div>
							<ul className="list-group" id="listb1">
								{ a }
							</ul>
						</div>
					</div>
				</div>
			);
		
		}
	},
	
	componentWillMount: function() {
		
		this.fireBaseRef = new Firebase('https://blinding-torch-8626.firebaseio.com/booked');
		
		this.fireBaseRef.on("value", function(snapshot) {
		
			if(snapshot.val() !== null && typeof snapshot.val() === 'object') {
				this.booked = [];
				_.each(snapshot.val(), function(value, k) {
					this.booked.push({ key: k, val: value });
				}, this);
			}
			
			this.setState({ booked: this.booked });

		}.bind(this));
	},
	
	getInitialState: function() {
		return { booked: [] };
	},
	
	bookObj: function(e, obj) {

		if(this.state.booker_name && this.state.booker_name.trim().length > 0 && this.state.booker_tel && this.state.booker_tel.trim().length > 0) {
			var newobj = { booker: this.state.booker_name, tel: this.state.booker_tel, booked: obj };
			this.fireBaseRef.push(newobj);
			this.props.baseRef.child(obj.key).remove();
			this.props.crud.bookedObj = undefined;
			this.setState({ booker_name: "", booker_tel: "" });
		}
	},
	
	removeBooked: function(obj) {
	
		console.log(obj);
		console.log(this.booked);
	
		var found = false;
		_.each(this.booked, function(value, key) {
			if(!found) {
				if(value.val.booked.key === obj.key) {
					found = true;
					this.booked.splice( key, 1 );
				}
			}
		}, this);
	}

});
	
