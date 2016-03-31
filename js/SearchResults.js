var React = require('react');
var $ = require('jquery');
var Utils = require('./Utils');
var URI = require('urijs');

var SearchResults = React.createClass({
    render: function () {
        var results = this.props.results;
        var topResults = this._findTopResults(results);
        var rows = [];
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
        return (
            <div>
                <div
                    className="hintCard"
                    ref="hintCard"
                    style={{display: "none"}}>
                    Search for:
                    <div className="code"><a /></div>
                </div>
                <table
                    className="code"
                    cellPadding="0"
                    cellSpacing="0"
                    onMouseUp={this._onMouseUp}>
                    <tbody>{rows}</tbody>
                </table>
            </div>
        );
    },

    _getResultRows: function (results) {
        var rows = [];
        for (var filePath in results) {
            var fileLink = this.props.prefix + filePath;
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
                var processedLine = this._htmlizeAndHighlight(
                    line,
                    this.props.q
                );
                // means this line is not highlighted using <strong> which
                // means this line didn't match the query, which means this was
                // a context line.
                var isContext = processedLine.indexOf('<') === -1;
                var className = isContext ? "contextCode" : "";
                var individualRow = this._getRowMarkup(
                    isContext ?
                        null :
                        <a href={fileLink+"$"+lineNum}>{lineNum}</a>,
                    <div
                        className={className}
                        dangerouslySetInnerHTML={{__html: processedLine}}>
                    </div>
                );
                rows.push(individualRow);
            }
            // Add an empty line.
            rows.push(this._getRowMarkup(null, <br />));
        }
        return rows;
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

    _htmlizeAndHighlight: function (text, query) {
        text = Utils.htmlize(text);
        query = Utils.htmlize(query);

        query = Utils.toRegexSafe(query);
        if (this.props.ww) {
            // Don't highlight partial matches if original query was for
            // whole-word match.
            query = "\\b" + query + "\\b";
        }
        var regex = new RegExp("(" + query + ")", "g"
            + (this.props.cs ? "" : "i"));
        return text.replace(regex, "<strong>$1</strong>");
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

    _findTopResults: function (results) {
        var topResults = {};
        for (var filePath in results) {
            if (Utils.isTopResultFile(
                    filePath,
                    results[filePath],
                    this.props.q,
                    this.props.cs)) {
                topResults[filePath] = results[filePath];
            }
        }
        return topResults;
    }
});

module.exports = SearchResults;