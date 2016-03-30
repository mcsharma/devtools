var React = require('react');
var ReactDOM = require('react-dom');
var URI = require('urijs');
var $ = require('jquery');
var Utils = require('./Utils.js');

var RootUI = React.createClass({
    componentDidMount: function () {
        if (!this.props.data.q) {
            this.refs.queryInput.focus();
        }
    },

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

    _onWholeWordCheck: function (event) {
        var ww = event.target.checked;
        var uri = URI(window.location.href);
        if (ww) {
            uri.setQuery("ww", 1);
        } else {
            uri.removeQuery("ww");
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

    _onMouseUp: function (event) {
        if (event.target.tagName.toLowerCase() === 'a') {
            window.location.href = event.target.href;
        }
        var text = Utils.trimNewlines(window.getSelection().toString());
        if (!text.trim() || text.split("\n").length > 1) {
            // selected multiple line, we probably don't want to show hintCard 
            // in this case
            $(this.refs.hintCard).hide();
            return;
        }
        this.refs.hintCard.style.left = event.pageX + 5;
        this.refs.hintCard.style.top = event.pageY - (30 + 10);
        this.refs.hintCard.style.width =
            Math.min(Math.max(200, text.length * 10), 500);
        $(this.refs.hintCard).find('a').text(text);
        $(this.refs.hintCard).find('a').attr('href', this._getQueryUrl(text));
        $(this.refs.hintCard).show();
    },

    _getQueryUrl: function (q) {
        var uri = URI(window.location.href);
        uri.setQuery("q", q);
        return uri;
    },

    render: function () {
        var results = this.props.data.results;
        var topResults = {};
        var count = 0;
        for(var filePath in results) {
            if (Utils.isTopResultFile(
                    filePath,
                    results[filePath],
                    this.props.data.q,
                    this.props.data.cs)) {
                topResults[filePath] = results[filePath];
            }
            for(var _ in results[filePath]) {
                count++;
            }
        }
        var resultsSummaryUI = null;
        if (this.props.data.q) {
            resultsSummaryUI = <span className="resultsCount">
                <strong>{count}</strong> results
                ({this.props.data.execTimeMs}ms)
            </span>;
        }
        return (
            <div>
                <div
                    className="hintCard"
                    ref="hintCard"
                    style={{display: "none"}}>
                    Search for:
                    <div className="code"><a /></div>
                </div>
                <div className="topBar">
                    <input
                        className="query"
                        name="q"
                        defaultValue={this.props.data.q}
                        placeholder="Type text and hit enter"
                        onKeyDown={this._onQueryChange}
                        ref="queryInput"/>
                    {resultsSummaryUI}
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
                            <option value="py">py</option>
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
                        <span className="filter">Whole word:</span>
                        {this.props.data.ww ?
                            <input
                                type="checkbox"
                                name="ww"
                                onClick={this._onWholeWordCheck}
                                defaultChecked="checked"
                            /> :
                            <input
                                type="checkbox"
                                name="ww"
                                onClick={this._onWholeWordCheck}
                            />
                        }
                    </span>
                </div>
                {this._renderResults(topResults, results)}
            </div>
        );
    },

    _htmlizeAndHighlight: function (text, query) {
        text = Utils.htmlize(text);
        query = Utils.htmlize(query);

        query = Utils.toRegexSafe(query);
        if (this.props.data.ww) {
            // Don't highlight partial matches if original query was for
            // whole-word match.
            query = "\\b" + query + "\\b";
        }
        var regex = new RegExp("(" + query + ")", "g"
            + (this.props.data.cs ? "" : "i"));
        return text.replace(regex, "<strong>$1</strong>");
    },

    _renderResults: function (topResults, results) {
        var rows = [];
       // topResults = {};
        if (!$.isEmptyObject(topResults)) {
            rows.push(this._getRowMarkup(
                null,
                <div className="resultsTitle">Top Results</div>)
            );
            rows = rows.concat(this._getResultRows(topResults));
            rows.push(this._getRowMarkup(
                null,
                <div className="sectionSeparator"/>)
            );
            rows.push(this._getRowMarkup(
                null,
                <div className="resultsTitle">All Results</div>)
            );
        } else if (!$.isEmptyObject(results)) {
            rows.push(this._getRowMarkup(
                null,
                <div className="marginTop30"></div>)
            );
        }
        rows = rows.concat(this._getResultRows(results));
        return <table
            className="code"
            cellPadding="0"
            cellSpacing="0"
            onMouseUp={this._onMouseUp}>
            <tbody>{rows}</tbody>
        </table>;
    },

    _getResultRows: function (results) {
        var rows = [];
        for (var filePath in results) {
            var fileLink = this.props.data.prefix + filePath;
            var fileHref =
                fileLink + "$" +
                Object.keys(results[filePath]).join(",");
            var mainRow = this._getRowMarkup(
                null,
                <a href={fileHref}>{filePath}</a>
            );
            rows.push(mainRow);
            for (var lineNum in results[filePath]) {
                var line = results[filePath][lineNum];
                var highlightedLine = this._htmlizeAndHighlight(
                    line,
                    this.props.data.q
                );
                var individualRow = this._getRowMarkup(
                    <a href={fileLink+"$"+lineNum}>{lineNum}</a>,
                    <div dangerouslySetInnerHTML={{__html: highlightedLine}}>
                    </div>
                );
                rows.push(individualRow);
            }
            // Add an empty line.
            rows.push(this._getRowMarkup(null, <br />));
        }
        return rows;
    }

});

module.exports = RootUI;