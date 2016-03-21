var React = require('react');
var ReactDOM = require('react-dom');
var URI = require('urijs');

var RootUI = React.createClass({
    _getRowMarkup: function (leftMarkup, rightMarkup) {
        if (typeof this.key == 'undefined') {
            this.key = 0;
        }
        return <tr key={this.key++}>
            <td className="leftPannel">{leftMarkup}</td>
            <td className="resultFileView">{rightMarkup}</td>
        </tr>
    },

    _onFileTypeChange: function (event) {
        var fileType = event.target.value;
        var uri = URI(window.location.href);
        if (fileType) {
            uri.setQuery("fileType", event.target.value);
        } else {
            uri.removeQuery("fileType");
        }
        window.location.href = uri;
    },

    _onCaseChange: function (event) {
        var cs = event.target.checked;
        var uri = URI(window.location.href);
        if (cs) {
            uri.setQuery("cs", 1);
        } else {
            uri.removeQuery("cs");
        }
        window.location.href = uri;
    },

    _onQueryChange: function (event) {
        if (event.keyCode != 13) {
            return;
        }
        var q = event.target.value;
        var uri = URI(window.location.href);
        if (q) {
            uri.setQuery("q", q);
            window.location.href = uri;
        }
    },

    render: function () {
        var i = 0;
        var rawResults = this.props.data.results;
        var results = {};
        var count = 0;
        rawResults.forEach(function (result) {
            var parts = result.substr(26).split(":");
            // filter
            if (this.props.data.fileType && !parts[0].endsWith("." + this.props.data.fileType)) {
                return;
            }
            count++;
            if (!results[parts[0]]) results[parts[0]] = {};
            results[parts[0]][parts[1]] = parts.slice(2).join(":");
        }.bind(this));
        var markups = [];
        for (var filePath in results) {
            if (!results.hasOwnProperty(filePath)) continue;
            var fileLink = this.props.data.prefix + filePath;
            var fileHref =
                fileLink + "$" +
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
                    this.props.data.q
                );
                var individualRow = this._getRowMarkup(
                    <a href={fileLink+"$"+lineNum}>{lineNum}</a>,
                    <div dangerouslySetInnerHTML={{__html: highlightedLine}}></div>
                );
                markups.push(individualRow);
            }
            // Add an empty line.
            markups.push(this._getRowMarkup(null, <br />));
        }
        var resultsCountUI = null, searchResultTitleUI = null;
        if (this.props.data.q) {
            resultsCountUI = <span className="resultsCount">{count} results found!</span>;
            searchResultTitleUI = <div className="resultsTitle">Search Results:</div>;
        }

        return (
            <div>
                <div className="topBar">
                    <input
                        className="query"
                        name="q"
                        defaultValue={this.props.data.q}
                        placeholder="Type text and hit enter"
                        onKeyDown={this._onQueryChange}
                        ref={function(input) {input.focus()}}
                    />
                    {resultsCountUI}
                    <span className="filters">
                        <span className="filter">File type:</span>
                        <select
                            className="fileTypeSelector"
                            name="fileType"
                            value={this.props.data.fileType}
                            onChange={this._onFileTypeChange}>
                            <option value="">all</option>
                            <option value="java">java</option>
                            <option value="cpp">cpp</option>
                            <option value="js">js</option>
                            <option value="go">go</option>
                        </select>
                        <span className="filter">Case sensitive:</span>
                        {this.props.data.cs ?
                            <input
                                type="checkbox"
                                name="cs"
                                onClick={this._onCaseChange}
                                defaultChecked="checked"
                            /> :
                            <input
                                type="checkbox"
                                name="cs"
                                onClick={this._onCaseChange}
                            />
                        }
                    </span>
                </div>
                {searchResultTitleUI}
                <table className="code" cellPadding="0" cellSpacing="0">
                    <tbody>{markups}</tbody>
                </table>
            </div>
        );
    },

    _highlightQuery: function (text, query) {
        var regex = new RegExp("(" + query + ")", "g" + (this.props.data.cs ? "" : "i"));
        return text.replace(regex, "<strong>$1</strong>");
    }

});

module.exports = RootUI;