var React = require('react');
var URI = require('urijs');

var FileTypeFilter = React.createClass({
    render: function () {
        return (
            <span>
                <span className="filter">File type:</span>
                <select
                    className="fileTypeSelector"
                    value={this.props.fileType}
                    onChange={this._onChange}>
                    <option value="">all</option>
                    <option value="cpp">cpp</option>
                    <option value="py">py</option>
                    <option value="go">go</option>
                    <option value="js/ts">js/ts both</option>
                    <option value="ts">ts</option>
                    <option value="js">js</option>
                    <option value="java">java</option>
                    <option value="txt">txt</option>
                </select>
            </span>
        );
    },
    _onChange: function (event) {
        var fileType = event.target.value;
        var uri = URI(window.location.href);
        if (fileType) {
            uri.setQuery("fileType", event.target.value);
        } else {
            uri.removeQuery("fileType");
        }
        window.location.href = uri;
    }
});

module.exports = FileTypeFilter;
