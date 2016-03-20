var React = require('react');
var ReactDOM = require('react-dom');
window.loadUI = function() {
	ReactDOM.render(
 	 <h1>{JSON.stringify({"a":"loda"})}</h1>,
 	 document.getElementById('example')
	);
};

