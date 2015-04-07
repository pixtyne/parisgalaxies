/** @jsx React.DOM */
define([ 'underscore', 'react', '../Formats'  ], function(_, React, Formats) {
    return React.createClass({
        displayName : 'ListItem.Default',
        mixins : [Formats],
        _formatContent : function(props) {
            var description = this.formatText(props.description);
            var addr = this.formatAddr(props);
            var city = this.formatCity(props);
            var activityList = props.sectors||[];
            var app = this.props.app;
            var activities = _.map(activityList, function(activity){
                //var name = app.nav.getCategoryName(activity);
                return this.formatText(activity);
            }, this).join(', '); 
            return _.filter([ this.DIV({
                key : 'activities',
                className: 'activities'
            }, activities), this.DIV({
                key : 'addr'
            }, addr)   ], this.notNull);
        },
        render: function() {
            var app = this.props.app;
            var d = this.props.data;
            var props = d.properties;
            var type = app.sites.getType(d);
            var key = 'li-' + app.sites.getId(d);
            // This flag is true for selected nodes
            var selected = this.props.selected; 
            var iconCls = 'right image';
            var itemCls = 'list-item' + (selected ? ' active' : ''); 
            var number = props.number;
            var vignette = 'none';
            if (props.vignette)
                vignette = 'url(images/vignettes/' + props.vignette+');';
            return (
                <div key={key} className={itemCls} style={this.props.style} onClick={this.props.onClick}>
                    <div><div className={iconCls} style={{"background-image": vignette}}></div></div>
                    <div className="label">
                        <div className="number left">
                            <div className="the-number">{number}</div>
                        </div>
                        <div className="desc">
                            <span>
                                <strong>
                                {props.label}
                                </strong>
                            </span>
                            {this._formatContent(props)}
                        </div>
                    </div>
                </div>
            );
        }
    });
});
 