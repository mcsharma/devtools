var React = require('react');
var OneTimeSetupForm = require('./OneTimeSetupForm');
var TopConfigBar = require('./TopConfigBar');
var ObjectExplorer = require('./ObjectExplorer');
var CookieHandler = require('../../common/CookieHandler');

var IdRootUI = React.createClass({

    setHostAndPort: function (host, port) {
        CookieHandler.setCookie("host", host);
        CookieHandler.setCookie("port", port);
        window.location.reload();
    },

    render: function () {
        var host = CookieHandler.getCookie('host'),
            port = CookieHandler.getCookie('port');
        if (!host || !port) {
            return (
                <OneTimeSetupForm
                    host={host}
                    port={port}
                    setHostAndPort={this.setHostAndPort}
                />
            );
        }
        return (
            <div>
                <TopConfigBar
                    host={host}
                    port={port}
                    setHostAndPort={this.setHostAndPort}
                />
                <ObjectExplorer
                    input={this.props.input}
                    error={this.props.error}
                    results={this.props.results}
                />
            </div>
        );
    }
});

module.exports = IdRootUI;
