var Hello = React.createClass({
	render: function() {
		return ( <div className="hello">Hello world!</div> );
	}
});

React.renderComponent(<div className="hello">Hello world!</div>, document.getElementById('main'));