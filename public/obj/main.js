var React = require('react');
var ReactDOM = require('react-dom');
var IdRootUI = require("./IdRootUI");
var URI = require('urijs');

window.onload = function () {
    var uri = URI(window.location.href);
    var input = uri.path().split('/')[2];
    ReactDOM.render(
        <IdRootUI
            error={window.response.error}
            results={window.response.results}
            input={input}
        />,
        document.getElementById("root")
    );
};