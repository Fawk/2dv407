var Hello = React.createClass({
	render: function() {
		return ( <div className="hello">Hello world!</div> );
	}
});

React.renderComponent(<Hello />, document.getElementById('main'));