var React = require('react');
var URI = require('urijs');

var CheckboxFilter = React.createClass({
    render: function () {
        return (
            <span>
                <span className="filter">{this.props.label}:</span>
                <input
                    type="checkbox"
                    defaultChecked={this.props.checked}
                    onClick={this._onToggle}
                />
            </span>
        );
    },

    _onToggle: function (event) {
        var uri = URI(window.location.href);
        if (event.target.checked) {
            uri.setQuery(this.props.name, this.props.value);
        } else {
            uri.removeQuery(this.props.name);
        }
        window.location.href = uri;
    }
});

module.exports = CheckboxFilter;