var React = require('react');
var URI = require('urijs');
var Comps = require('./Comps');

var ObjectExplorer = React.createClass({

    componentDidMount: function() {
        if (!this.props.input && this.refs.input) {
            this.refs.input.focus();
        }
    },

    onInput: function (event) {
        if (event.keyCode != 13 || !event.target.value.trim()) {
            return;
        }
        var uri = URI(window.location.href);
        uri.segment(1, event.target.value);
        window.location.href = uri;
    },

    onSearchClick: function(event) {
        var input = this.refs.input.value.trim();
        var uri = URI(window.location.href);
        uri.segment(1, input);
        window.location.href = uri;
    },

    render: function() {
        var input =
            <div className="input">
                <div className="input-group">
                    <input
                        ref="input"
                        className="form-control"
                        placeholder="Search by object name, GUID or table name" type="text"
                        defaultValue={this.props.input} onKeyDown={this.onInput}>
                    </input>
                    <span className="input-group-btn">
                        <button className="btn btn-primary" type="button"
                                aria-label="Search" onClick={this.onSearchClick}>
                            <span className="glyphicon glyphicon-search" aria-hidden="true" />
                        </button>
                    </span>
                </div>
            </div>;

        var response = null, typeInfo = null;
        if (this.props.input) {
            if (this.props.error) {
                response =
                    <div className="unusualResponse">
                        <div className="alert alert-danger">
                            {this.props.error}
                        </div>
                    </div>;
            } else if (this.props.results.length === 0) {
                response =
                    <div className="unusualResponse">
                        <div className="alert alert-danger">
                            No row was found for this input!
                        </div>
                    </div>;
            } else if (this.props.results.length == 1) {
                typeInfo =
                    <span className="typeInfo">
                        {this.props.results[0].type}
                    </span>;
                response =
                    <Comps.JsonView className="mainTable" data={this.props.results[0].row} />;
            } else {
                response = <div className="unusualResponse">
                    <div className="alert alert-info">
                        <strong>{this.props.results.length}</strong> results found, pick one!
                    </div>
                    <table className="table table-condensed">
                        <thead>
                        <tr>
                            <th>Metadata Type</th>
                            <th>Name</th>
                            <th>ID</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.props.results.map(function (result) {
                            return (
                                <tr key={result.row.id}>
                                    <td>{result.type}</td>
                                    <td>{result.row.name}</td>
                                    <td><Comps.Guid guid={result.row.id} /></td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>;
            }
        }

        return (
            <div className="objectExplorer">
                <table>
                    <tbody>
                        <tr>
                            <td>{input}</td>
                            <td>{typeInfo}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="response">
                    {response}
                </div>
            </div>
        );
    }
});

module.exports = ObjectExplorer;