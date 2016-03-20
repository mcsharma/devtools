var React = require('react');
var ReactDOM = require('react-dom');

var RootUI = React.createClass({
    render: function () {
        var i = 0;
        return (
            <div>
                <div>
                    <form action="/" method="get">
                        <input
                            name="q"
                            defaultValue={this.props.data['q']}
                            placeholder="Type text to search"
                        />
                        <input type="submit" value="Search"/>
                    </form>
                </div>
                <div>Search Results:</div>
                <div>
                    {this.props.data['results'].map(function (result) {
                        var parts = result.substr(26).split(":");
                        var url =
                            this.props.data.prefix +
                            parts[0] +
                            "$" + parts[1];
                        var text = parts[0] + ":" + parts[1];
                        return (
                            <div key={i++}>
                                <div><a href={url}>{text}</a></div>
                                <div>{parts[2]}</div>
                            </div>
                        );
                    }.bind(this))}
                </div>
            </div>
        );
    }
});

module.exports = RootUI;