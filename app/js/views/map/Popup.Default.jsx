/** @jsx React.DOM */
define([ 'underscore', 'react', '../Formats'  ], function(_, React, Formats) {
    return React.createClass({
        displayName : 'ListItem.Default',
        mixins : [Formats],
        render: function() {
            var app = this.props.app;
            var d = this.props.data;
            var props = d.properties;
            var type = app.sites.getType(d);
            var icon = app.ui.getCategoryIconName(type);
            // This flag is true for selected nodes
            var selected = this.props.selected; 
            return (
                <div className="panel panel-default" style={this.props.style}>
                    <div className="panel-heading">
                      <h4>
                          <i className={icon}></i>
                          {' '}
                          <a href="#"  onClick={this.props.onClick}>
                              {props.name}
                          </a>
                      </h4>
                    </div>
                    <div className="panel-body">
                        {this._formatContent(props)}
                    </div>
                </div>
            );
        }
    });
});
 