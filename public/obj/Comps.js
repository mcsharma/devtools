var React = require('react');
var ReactDOM = require('react-dom');
var moment = require('moment');
var classnames = require('classnames');
var $ = require('jquery');
var URI = require('urijs');
var metadataHeaderFields = require('../../common/MetadataHeaderFields');
var Utils = require('../../common/Utils');
var ShyContent = require('./ShyContent');
var RenderInBody = require('./RenderInBody');

var HOVER_FETCH_DELAY_MS = 500;

var JsonView = React.createClass({
    render: function () {
        return this.getMarkupRecursive(this.props.data);
    },

    getMarkupRecursive: function (data, field, depth) {
        if (depth === undefined) {
            depth = 0;
        }

        if (data === undefined) {
            console.warn("data prop is undefined");
            return "";
        }

        if (data === null) {
            return "";
        }

        if (typeof data === 'string') {
            if (field === 'created' || field === 'modified') {
                return data + " (" + moment.unix(Number(data) / 1000).format() + ")";
            }
            if (Utils.isGuid(data)) {
                return <Guid guid={data}/>;
            } else if (data.length > 200) {
                return <ShyContent>{data}</ShyContent>;
            } else {
                return data;
            }
        }

        if (typeof data !== 'object') {
            return JSON.stringify(data);
        }

        var rows = [];
        // First display the header fields, in the order they are present in the array.
        for (var i = 0; i < metadataHeaderFields.length; i++) {
            var header = metadataHeaderFields[i];
            if (data.hasOwnProperty(header)) {
                rows.push([header, this.getMarkupRecursive(data[header], header, depth + 1)]);
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
                        {this.getMarkupRecursive(data[key], key, depth + 1)}
                    </ShyContent>
                    : this.getMarkupRecursive(data[key], key, depth + 1)
            ]);
        }

        var className = classnames(
            "dataTable table table-condensed table-bordered table-striped",
            this.props.className
        );
        return (
            <table className={className}>
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

var Guid = React.createClass({
    getInitialState: function () {
        return {};
    },

    componentDidUpdate: function () {
        var hovercard = null, root = null;
        if (this.state.vis) {
            var $hovercards = $(ReactDOM.findDOMNode(this)).closest('.hovercard');
            if ($hovercards.length) {
                hovercard = $hovercards[0];
                $(hovercard).on('mousedown', function (e) {
                    if (this.isMounted()) {
                        this.setState({vis: false});
                    }
                }.bind(this));
            } else {
                root = $(ReactDOM.findDOMNode(this)).closest('#root');
                $(root).on('mousedown', function (e) {
                    if (this.isMounted()) {
                        this.setState({vis: false});
                    }
                }.bind(this));
            }
        } else {
            if (hovercard) {
                $(hovercard).unbind('mousedown');
            }
            if (root) {
                $(root).unbind('mousedown');
            }
        }
    },

    componentWillUnmount: function () {
        $(window).off('mousedown.guid');
    },

    fetchHoverCard: function (event) {
        event.persist();
        var self = this;
        this.timeout = setTimeout(function () {
            self.timeout = null;
            $.ajax({
                url: URI(event.target.href).addQuery('ajax', 1),
                success: function (results) {
                    if (results.length !== 1) {
                        console.warn(
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
                    var state = result;
                    state.vis = true;
                    state.left = event.pageX;
                    state.top = event.pageY;
                    self.setState(state);
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

    render: function () {
        return (
            <div>
                <a onMouseOver={this.fetchHoverCard}
                   onMouseOut={this.cancelHoverCardFetchRequest}
                   onClick={this.cancelHoverCardFetchRequest}
                   href={"/obj/"+this.props.guid}>
                    {this.props.guid}
                </a>
                {this.state.vis ?
                    <RenderInBody>
                        <HoverCard
                            left={this.state.left}
                            top={this.state.top}
                            type={this.state.type}
                            data={this.state.row}
                        />
                    </RenderInBody>
                    : null
                }
            </div>
        );
    }
});

var HoverCard = React.createClass({
    render: function () {
        return (
            <div
                className="hovercard"
                style={{left: this.props.left, top: this.props.top}}>
                <h4>Type: {this.props.type}</h4>
                <JsonView className="hoverTable" data={this.props.data}/>
            </div>
        );
    }
});

module.exports = {
    JsonView: JsonView,
    Guid: Guid,
    HoverCard: HoverCard
};

