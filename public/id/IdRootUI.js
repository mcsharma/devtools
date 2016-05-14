var React = require('react');
var URI = require('urijs');
var $ = require('jquery');
var moment = require('moment');
var metadataHeaderFields = require('../../common/MetadataHeaderFields');
var Utils = require('../../common/Utils');
var ShyContent = require('./ShyContent');

var HOVER_FETCH_DELAY_MS = 400;

var IdRootUI = React.createClass({

    getInitialState: function () {
        return {
            hover: {}
        };
    },

    componentDidMount: function () {
        if (!this.props.input && this.refs.idInput) {
            this.refs.idInput.focus();
        } else if (this.refs.host && !this.refs.host.value) {
            this.refs.host.focus();
        } else if (this.refs.port && !this.refs.port.value) {
            this.refs.port.focus();
        }

        $(document).mousedown(function (e) {
            if (!$(e.target).closest('.hovercard').length) {
                var hover = this.state.hover;
                if (hover.vis) {
                    hover.vis = false;
                    this.setState({hover: hover});
                }
            }
        }.bind(this));
    },

    fetchHoverCard: function (event) {
        event.persist();
        var self = this;
        this.timeout = setTimeout(function () {
            $.ajax({
                url: URI(event.target.href).addQuery('ajax', 1),
                success: function (results) {
                    if (results.length !== 1) {
                        console.error(
                            "No row was found for " + URI(event.target.href).path().split('/')[2]
                        );
                        return;
                    }
                    var result = results[0];
                    for (var key in result.row) {
                        if (metadataHeaderFields.indexOf(key) === -1) {
                            delete result.row[key];
                        }
                    }
                    var hover = result;
                    hover.x = event.pageX;
                    hover.y = event.pageY;
                    hover.vis = true;
                    self.setState({hover: hover});
                }
            });
        }, HOVER_FETCH_DELAY_MS);
    },

    cancelHoverCardFetchRequest: function () {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    },

    getCookie: function (cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    },

    setCookie: function (cname, cvalue) {
        document.cookie = cname + "=" + cvalue + "; path=/";
    },

    setHostAndPort: function () {
        this.setCookie("host", this.refs.host.value);
        this.setCookie("port", this.refs.port.value);
        window.location.reload();
    },

    onInput: function (event) {
        if (event.keyCode != 13 || !event.target.value.trim()) {
            return;
        }
        var uri = URI(window.location.href);
        uri.segment(1, event.target.value);
        window.location.href = uri;
    },

    onSearchClick: function(event) {
        var input = this.refs.idInput.value.trim();
        var uri = URI(window.location.href);
        uri.segment(1, input);
        window.location.href = uri;
    },

    render: function () {
        var host = this.getCookie('host'), port = this.getCookie('port');
        if (!host || !port) {
            return (
                <div className="primaryDbConfig">
                    <div className="help">
                        Set the host and port of postgres server of your cluster. You can
                        find this information by running<br/>
                        <strong>
                            "/usr/local/scaligent/toolchain/local/bin/pgtool $@ lookup"
                        </strong>
                    </div>
                    <table className="table borderless">
                        <tbody>
                        <tr>
                            <td>
                                <input
                                    placeholder="Host IP, example: 10.77.144.84"
                                    className="form-control" ref="host" type="text"
                                    defaultValue={host}>
                                </input>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <input placeholder="Port, example: 3582"
                                       className="form-control" ref="port" type="text"
                                       defaultValue={port}>
                                </input>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <button type="button"
                                        className="btn btn-primary"
                                        onClick={this.setHostAndPort}>
                                    set
                                </button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            );
        }

        var topRightDBConfig =
            <div>
                <div className="topRightDbconfig form-inline">
                    <div className="form-group">
                        <label for="host" className="control-label">Host IP:</label>
                        <input className="input-sm form-control"
                               ref="host" id="host" type="text"
                               defaultValue={host}>
                        </input>
                        <label for="port" className="control-label">Port:</label>
                        <input className="input-sm form-control"
                               ref="port" id="port" type="text"
                               defaultValue={port}>
                        </input>
                        <button type="button"
                                className="form-control btn btn-default btn-xs"
                                onClick={this.setHostAndPort}>
                            update
                        </button>
                    </div>
                </div>
                <div style={{clear: "both"}}></div>
            </div>;

        var idInput =
            <div className="input">
                <div className="input-group">
                    <input
                        ref="idInput" id="idInput"
                        className="form-control"
                        placeholder="Enter name or GUID of an object" type="text"
                        defaultValue={this.props.input} onKeyDown={this.onInput}>
                    </input>
                    <span className="input-group-btn">
                        <button className="btn btn-primary" type="button"
                                aria-label="Search" onClick={this.onSearchClick}>
                            <span className="glyphicon glyphicon-search" aria-hidden="true" />
                        </button>
                    </span>
                </div>
            </div>;

        var response = null, typeInfo = null;
        if (this.props.input) {
            if (this.props.results.length === 0) {
                response =
                    <div className="noResultResponse alert alert-danger">
                        No row was found for this input!
                    </div>;
            } else if (this.props.results.length == 1) {
                typeInfo =
                    <span className="typeInfo">
                        {this.props.results[0].type}
                    </span>;
                response =
                    <div className="dataTable">
                        {this.getMarkupRecursive("", this.props.results[0].row)}
                    </div>;
            } else {
                response = <div className="multiResultResponse">
                    <div className="alert alert-info">
                        Multiple Results found, choose one!
                    </div>
                    <table className="table table-condensed">
                        <thead>
                        <tr>
                            <th>Metadata Type</th>
                            <th>Name</th>
                            <th>ID</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.props.results.map(function (result) {
                            return (
                                <tr key={result.row.id}>
                                    <td>{result.type}</td>
                                    <td>{result.row.name}</td>
                                    <td><a href={"/id/"+result.row.id}>
                                        {result.row.id}
                                    </a></td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>;
            }
        }

        return (
            <div>
                {topRightDBConfig}
                {idInput}
                {typeInfo}
                <div className="response">
                    {response}
                </div>
                {this.state.hover.vis
                    ? <div
                    className="hovercard"
                    ref="hovercard"
                    style={{left: this.state.hover.x, top: this.state.hover.y}}>
                    <h4>Type: {this.state.hover.type}</h4>
                    {this.getMarkupRecursive("", this.state.hover.row)}
                </div>
                    : null}
            </div>
        );
    },

    getMarkupRecursive: function (field, data, depth) {
        if (depth === undefined) {
            depth = 0;

        }
        if (data === null) {
            return "";
        }
        if (typeof data === 'string') {
            if (field === 'created' || field === 'modified') {
                return data + " (" + moment.unix(Number(data) / 1000).format() + ")";
            }
            if (Utils.isGuid(data)) {
                return <a
                    onMouseOver={this.fetchHoverCard}
                    onMouseOut={this.cancelHoverCardFetchRequest}
                    href={"/id/"+data}>
                    {data}
                </a>;
            } else if (data.length > 200) {
                return <ShyContent>{data}</ShyContent>;
            } else {
                return data;
            }
        }

        if (typeof data != 'object') {
            return JSON.stringify(data);
        }

        var rows = [];
        // First display the header fields, in the order they are present in the array.
        for (var i = 0; i < metadataHeaderFields.length; i++) {
            var header = metadataHeaderFields[i];
            if (data.hasOwnProperty(header)) {
                rows.push([header, this.getMarkupRecursive(header, data[header], depth + 1)]);
            }
        }
        // Now display other fields.
        for (var key in data) {
            if (metadataHeaderFields.indexOf(key) !== -1) {
                continue;
            }
            rows.push([
                key,
                Array.isArray(data) ?
                    <ShyContent>
                        {this.getMarkupRecursive(key, data[key], depth + 1)}
                    </ShyContent>
                    : this.getMarkupRecursive(key, data[key], depth + 1)
            ]);
        }

        return (
            <table className="table table-condensed table-bordered table-striped">
                <tbody>
                {rows.map(function (row) {
                    return (
                        <tr key={row[0]}>
                            <td className={"rowKey depth" + depth}>{row[0]}</td>
                            <td className="rowValue">{row[1]}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        );
    }
});

module.exports = IdRootUI;
