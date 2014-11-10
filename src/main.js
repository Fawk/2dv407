/** @jsx React.DOM */

var App = require('./components/app'),
    React = require('react');

React.renderComponent(
  App,
  document.getElementById('main'));
  
var Hello = React.createClass({
	render: function() {
		return ( <div className="hello">Hello world!</div> );
	}
});

React.renderComponent(<Hello />, document.getElementById('main'));