var React = require('react');

var ShyContent = React.createClass({

    getInitialState: function() {
        return {};
    },

    onClick: function(evt) {
        evt.preventDefault();
        this.setState({visible: !this.state.visible});
    },

    render: function() {
        return (
            <div>
                <a href="#" onClick={this.onClick}>
                    {this.state.visible ? '{click to hide}' : '{click to show}'}
                </a>
                {this.state.visible ? <div>{this.props.children}</div> : null}
            </div>
        );
    }
});

module.exports = ShyContent;