var React = require('react');
var URI = require('urijs');
var $ = require('jquery');
var Utils = require('./Utils');
var CheckboxFilter = require('./CheckboxFilter');
var FileTypeFilter = require('./FileTypeFilter');
var SearchResults = require('./SearchResults');

var RootUI = React.createClass({
    componentDidMount: function () {
        if (!this.props.data.q) {
            this.refs.queryInput.focus();
        }
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
        var resultsSummaryUI = null;
        if (this.props.data.q) {
            resultsSummaryUI = <span className="resultsCount">
                <strong>{this.props.data.count}</strong> results
                ({this.props.data.execTimeMs}ms)
            </span>;
        }
        return (
            <div>
                <div className="topBar">
                    <input
                        className="query"
                        defaultValue={this.props.data.q}
                        placeholder="Type text and hit enter"
                        onKeyDown={this._onQueryChange}
                        ref="queryInput"/>
                    {resultsSummaryUI}
                    <span className="filters">
                        <FileTypeFilter fileType={this.props.data.fileType}/>
                        <CheckboxFilter
                            name="cs" value={1}
                            checked={this.props.data.cs}
                            label="Case sensitive"/>
                        <CheckboxFilter
                            name="ww" value={1}
                            checked={this.props.data.ww}
                            label="Whole word"/>
                        <CheckboxFilter
                            name="context" value={2}
                            checked={this.props.data.context}
                            label="Show context"/>
                    </span>
                </div>
                <SearchResults
                    results={this.props.data.results}
                    q={this.props.data.q}
                    cs={this.props.data.cs}
                    ww={this.props.data.ww}
                    prefix={this.props.data.prefix}/>
            </div>
        );
    }
});

module.exports = RootUI;