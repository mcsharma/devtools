var React = require('react');
var URI = require('urijs');
var $ = require('jquery');
var moment = require('moment');
var metadataHeaderFields = require('../../common/MetadataHeaderFields');
var Utils = require('../../common/Utils');

var IdRootUI = React.createClass({

    getInitialState: function () {
        return {
            hover: {}
        };
    },

    componentDidMount: function () {
        if (!this.props.id && this.refs.idInput) {
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
                success: function (response) {
                    for (var key in response.data) {
                        if (metadataHeaderFields.indexOf(key) === -1) {
                            delete response.data[key];
                        }
                    }
                    var hover = response;
                    hover.x = event.pageX;
                    hover.y = event.pageY;
                    hover.vis = true;
                    self.setState({hover: hover});
                }
            });
        }, 250);
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

    render: function () {
        var host = this.getCookie('host'), port = this.getCookie('port');
        if (!host || !port) {
            return (
                <div className="hostAndPort">
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
                <div className="dbconfig form-inline">
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
            <input
                ref="idInput"
                className="form-control idInput"
                placeholder="paste a GUID and hit enter" type="text"
                defaultValue={this.props.id} onKeyDown={this.onInput}>
            </input>;

        if (!this.props.id) {
            return (
                <div>
                    {topRightDBConfig}
                    <div style={{marginTop:"75px", textAlign: "center"}}>
                        {idInput}
                    </div>
                </div>
            );
        }

        var typeInfo = null, dataTable = null;
        if (this.props.data) {
            typeInfo = <span className="typeInfo">
          Type: {this.props.metadataType}
        </span>;
            dataTable = this.getMarkupRecursive("", this.props.data);
        } else {
            dataTable = <div className="noDataMessage alert alert-danger">
                No row was found for this ID.
            </div>;
        }

        return (
            <div>
                {topRightDBConfig}
                <div className="header">
                    {idInput}
                    {typeInfo}
                </div>
                <div className="dataTable">
                    {dataTable}
                </div>
                {this.state.hover.vis ? <div
                    className="hovercard"
                    ref="hovercard"
                    style={{
                left: this.state.hover.x,
                top: this.state.hover.y}}>
                    <h4>Type: {this.state.hover.metadataType}</h4>
                    {this.getMarkupRecursive("", this.state.hover.data)}
                </div> : null}
            </div>
        );
    },

    getMarkupRecursive: function (field, data) {
        if (data === null) {
            return "";
        }
//        if (field === "sageContext") return "";
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
                rows.push([header, this.getMarkupRecursive(header, data[header])]);
            }
        }
        // Now display other fields.
        for (var key in data) {
            if (metadataHeaderFields.indexOf(key) !== -1) {
                continue;
            }
            rows.push([key, this.getMarkupRecursive(key, data[key])]);
        }

        return (
            <table className="table table-condensed table-bordered table-striped">
                <tbody>
                {rows.map(function (row) {
                    return (
                        <tr key={row[0]}>
                            <td className="col-md-1">{row[0]}</td>
                            <td className="col-md-11">{row[1]}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        );
    }
});

module.exports = IdRootUI;
