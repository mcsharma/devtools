var React = require('react');
var URI = require('urijs');
var $ = require('jquery');
var Utils = require('./Utils');
var CheckboxFilter = require('./CheckboxFilter');
var FileTypeFilter = require('./FileTypeFilter');
var SearchResults = require('./SearchResults');

var RootUI = React.createClass({
    componentDidMount: function () {
        this.refs.queryInput.focus();
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
            resultsSummaryUI =
                <div className="perf-info">
                    <strong>{this.props.data.count}</strong> results ({this.props.data.execTimeMs}ms)
                </div>;
        }
        return (
            <div className="root-ui">
                <div className="top-bar">
                    <div className="non-empty-input-section">
                        {this.props.data.q ? <input
                            className="non-empty-query"
                            defaultValue={this.props.data.q}
                            onKeyDown={this._onQueryChange}
                            ref="queryInput"/> : null}
                        {resultsSummaryUI}
                    </div>
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
                    <div className="author">
                        Author: mahesh@thoughtspot.com
                    </div>
                </div>
                <div className="main-content">
                    {this.props.data.q
                        ? <div className="search-result-content">
                            <SearchResults
                                results={this.props.data.results}
                                q={this.props.data.q}
                                cs={this.props.data.cs}
                                ww={this.props.data.ww}
                                prefix={this.props.data.prefix}
                            />
                        </div>
                        :
                        <div className="empty-input-content">
                            <div className="logo-wrapper"><img className="ts-logo" src="logo.png"/></div>
                            <div className="input">
                                <div className="input-group">
                                    <input
                                        ref="queryInput"
                                        className="form-control empty-query"
                                        placeholder="Type text and hit enter" type="text"
                                        defaultValue={this.props.data.q} onKeyDown={this._onQueryChange}>
                                    </input>
                                    <span className="input-group-btn">
                                    <button className="btn btn-primary" type="button"
                                            aria-label="Search">
                                        <span className="glyphicon glyphicon-search" aria-hidden="true"/>
                                    </button>
                                 </span>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        );
    }
});

module.exports = RootUI;
