var React = require('react');
var ReactDOM = require('react-dom');
var IdRootUI = require("./IdRootUI");
var URI = require('urijs');
var ShyContent = require('./ShyContent');
window.onload = function () {
  var uri = URI(window.location.href);
  var id = uri.path().split('/')[2];
  ReactDOM.render(
    <IdRootUI
      metadataType={window.metadataType}
      data={window.data}
      id={id}
    />,
    document.getElementById("root")
  );
};
