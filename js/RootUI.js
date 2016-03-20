var React = require('react');
var ReactDOM = require('react-dom');

var RootUI = React.createClass({
    render: function () {
        var i = 0;
        var results = this.props.data['results'];
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
                        <span> {results.length} results found!</span>
                    </form>
                </div>
                <div>Search Results:</div>
                <div>
                    {results.map(function (result) {
                        var parts = result.substr(26).split(":");
                        var url =
                            this.props.data.prefix +
                            parts[0] +
                            "$" + parts[1];
                        var text = parts[0] + ":" + parts[1];
                        return (
                            <div key={i++}>
                                <div><a href={url}>{text}</a></div>
                                <div dangerouslySetInnerHTML={{
                                    __html: this._highlightQuery(
                                        parts[2],
                                        this.props.data['q'])
                                    }}>
                                </div>
                                <br />
                            </div>
                        );
                    }.bind(this))}
                </div>
            </div>
        );
    },

    _highlightQuery: function (text, query) {
        var regex = new RegExp("(" + query + ")", "gi");
        return text.replace(regex, "<strong>$1</strong>");
    }

});

module.exports = RootUI;