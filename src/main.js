/** @jsx React.DOM */

var App = require('./components/app'),
    React = require('react');

React.renderComponent(
  App,
  document.getElementById('main'));
  
var Hello = React.createClass({
	render: function() {
		return ( <div class="hello">Hello world!</div> );
	}
});

React.render(<Hello />, document.getElementById('main'));