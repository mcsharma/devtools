var React = require('react');

var TopConfigBar = React.createClass({

    onUpdateButtonClick: function (event) {
        this.props.setHostAndPort(this.refs.host.value, this.refs.port.value);
    },

    render: function () {
        return (
            <div className="topBar">
                <div className="topRightDbconfig form-inline">
                    <div className="form-group">
                        <label for="host" className="control-label">Host IP:</label>
                        <input
                               ref="host" id="host" type="text"
                               defaultValue={this.props.host}>
                        </input>
                        <label for="port" className="control-label">Port:</label>
                        <input
                               ref="port" id="port" type="text"
                               defaultValue={this.props.port}>
                        </input>
                        <button type="button"
                                onClick={this.onUpdateButtonClick}>
                            update
                        </button>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = TopConfigBar;