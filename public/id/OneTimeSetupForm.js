var React = require('react');

var OneTimeSetupForm = React.createClass({

    componentDidMount: function() {
        if (this.refs.host && !this.refs.host.value) {
            this.refs.host.focus();
        } else if (this.refs.port && !this.refs.port.value) {
            this.refs.port.focus();
        }
    },

    onSetButtonClick: function(event) {
        this.props.setHostAndPort(this.refs.host.value, this.refs.port.value);
    },

    render: function () {
        return (
            <div className="primaryDbConfig">
                <div className="help">
                    Set the host and port of postgres server of your cluster. You can
                    find this information by running<br/>
                    <strong>
                        "/usr/local/scaligent/toolchain/local/bin/pgtool $@ lookup"
                    </strong>
                </div>
                <table className="table borderless">
                    <tbody>
                    <tr>
                        <td>
                            <input
                                placeholder="Host IP, example: 10.77.144.84"
                                className="form-control" ref="host" type="text"
                                defaultValue={this.props.host}>
                            </input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <input placeholder="Port, example: 3582"
                                   className="form-control" ref="port" type="text"
                                   defaultValue={this.props.port}>
                            </input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <button type="button"
                                    className="btn btn-primary"
                                    onClick={this.onSetButtonClick}>
                                set
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        );

    }
});

module.exports = OneTimeSetupForm;