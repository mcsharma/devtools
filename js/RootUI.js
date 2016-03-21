var React = require('react');
var ReactDOM = require('react-dom');

var RootUI = React.createClass({
    _getRowMarkup: function (leftMarkup, rightMarkup) {
        if (typeof this.key == 'undefined') {
            this.key = 0;
        }
        return <tr key={this.key++}>
            <td className="resultLineNumber">{leftMarkup}</td>
            <td className="resultFileView">{rightMarkup}</td>
        </tr>
    },

    render: function () {
        var i = 0;
        var rawResults = this.props.data['results'];
        var results = {};
        rawResults.forEach(function (result) {
            var parts = result.substr(26).split(":");
            if (!results[parts[0]]) results[parts[0]] = {};
            results[parts[0]][parts[1]] = parts[2];
        });
        var markups = [];
        for (var filePath in results) {
            if (!results.hasOwnProperty(filePath)) continue;
            var fileHref =
                this.props.data.prefix +
                filePath + "$" +
                Object.keys(results[filePath]).join(","); // Phabricator will highlight these lines
            var mainRow = this._getRowMarkup(
                null,
                <a href={fileHref}>{filePath}</a>
            );
            markups.push(mainRow);
            for (var lineNum in results[filePath]) {
                if (!results[filePath].hasOwnProperty(lineNum)) continue;
                var line = results[filePath][lineNum];
                var highlightedLine = this._highlightQuery(
                    line,
                    this.props.data['q']
                );
                var individualRow = this._getRowMarkup(
                    lineNum,
                    <div dangerouslySetInnerHTML={{__html: highlightedLine}}></div>
                );
                markups.push(individualRow);
            }
            // Add an empty line.
            markups.push(this._getRowMarkup(null, <br />));
        }
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
                        <span> {rawResults.length} results found!</span>
                    </form>
                </div>
                <div className="resultsTitle">Search Results:</div>
                <table className="code" cellPadding="0" cellSpacing="0">
                    <tbody>{markups}</tbody>
                </table>
            </div>
        );
    },

    _highlightQuery: function (text, query) {
        var regex = new RegExp("(" + query + ")", "gi");
        return text.replace(regex, "<strong>$1</strong>");
    }

});

module.exports = RootUI;