/**
 * @jsx React.DOM
 */
define(
// Dependencies
[ 'require', 'underscore', 'react', 'mosaic-core', 'mosaic-commons',
      './AppViewMixin', './Formats', './DomUtilsMixin'],
// Module
function(require) {
    'use strict';
    var _ = require('underscore');
    var React = require('react');
    var Mosaic = require('mosaic-commons');
    var AppViewMixin = require('./AppViewMixin');
    var Formats = require('./Formats');
    var DomUtilsMixin = require('./DomUtilsMixin');
    
    return React.createClass({
        displayName : 'EntityDetailsPanel',
        mixins : [AppViewMixin, Formats, DomUtilsMixin],
        componentWillMount : function() {
            this.setViewportParams = _.bind(this.setViewportParams, this);
        },
        componentDidMount : function(){
            this._updateHeight();
        },
        componentDidUpdate : function(){
            this._updateHeight();
        },
        _updateHeight : function(){
            var header = this.refs.header;
            var inner = this.refs.inner;
            if (!header || !inner)
                return ;
            var headerHeight = this._getOuterHeight(header.getDOMNode());
            var height = this.state.height;
            var top = this.state.height;
            height = Math.max(0, height - headerHeight);
            var innerNode = inner.getDOMNode();
            innerNode.style.maxHeight = height + 'px'; 
            var node = this.getDOMNode();
            node.style.top = top;
        },
        _newState : function(options) {
            var state = _.extend({
                top : 'auto',
                height: '193px',
                expanded : true
            }, this.state, options);
            return state;
        },
        _getStore : function() {
            return this.props.app.nav;
        },
        _formatDescription : function(props){
            var description = this.formatText(props.description);
            if (!description)
                return undefined;
            var style = 'field description';
            if (!this.state.expanded) {
                style +=' row mobile-hidden';
            } 
            return <p className={style}>{description}</p>;
        },
        
        _formatTags : function(props) {
            if (!props.tags)
                return undefined;
            var tags = [];
            _.each(props.tags, function(tag) {
                tags.push('#'+tag);
            });
            var str = tags.join(' ');
            return <span>{str}</span>
        },
        
        _formatHeader : function(d){
            var app = this.props.app;
            var type = app.sites.getType(d);
            var props = d.properties;
            var description = this.formatText(props.description);
            var activityList = props.sectors||[];
            var activities = _.map(activityList, function(activity, pos){
                // var activityName = app.nav.getCategoryName(activity);
                return this.formatText(activity);
            }, this).join(', '); 
            var header = _.filter([ this.DIV({
                key : 'activities',
                className: 'field activities'
            }, activities) ], this.notNull);
            return (<div className="place-info-top" ref="header">
                <a className="close" key="close" href="#" onClick={this._handleCloseAction}></a>
                <h2>{this.formatText(props.label)}</h2>
                {header}
            </div>);
        },
        _formatLeftColumn : function(props) {
            var access = props.transport ? 'Accès : '+ props.transport : null;
            var accessDuration = props.time ? 'From Châtelet : '+ props.time : null;
            return _.filter([ this.DIV({
                className: 'field access',
                key : 'access'
            }, access), this.DIV({
                className: 'field access-duration',
                key : 'time'
            }, accessDuration) 
            ], this.notNull);
        },
        
      
        _handleCloseAction : function(ev){
            ev.stopPropagation();
            ev.preventDefault();
            var nav = this._getStore();
            var siteId = nav.getSelectedSiteId();
            nav.actions.toggleSiteSelection({
                siteId : siteId
            });
        },
        _toggleViewSize : function(ev){
            ev.stopPropagation();
            this.setState(this._newState({
                expanded : !this.state.expanded
            }));
        },
        _focusOnMap : function(e){
            var nav = this._getStore();
            var siteId = nav.getSelectedSiteId();
            nav.actions.selectSite({
                siteId : siteId
            });
            e.preventDefault();
            e.stopPropagation();
        },
        _formatBottomPanel : function(){
            var toggleLabel;
            var className;
            if (this.state.expanded) {
                toggleLabel = "Moins d'information...";
                className = 'place-info-bottom opened';
            } else {
                toggleLabel = "Plus d'information...";
                className = 'place-info-bottom closed';
            } 
// <div className="focus-on-map"
// onClick={this._focusOnMap}>Montrer sur la carte</div>
            
            return (
                <div className={className}>
                   <div className="place-info-toggle"
                        onClick={this._toggleViewSize}>{toggleLabel}</div>
                </div>
            );
        },
        setViewportParams : function(height, pos) {
            this.setState(this._newState({
                top: pos + 'px',
                height : height,
            }));
        },
        render : function(){
            var nav = this._getStore();
            var selectedSite = nav.getSelectedSite();
            if (!selectedSite)
                return <div />;
                
            var contentClassName = React.addons.classSet({
                'details-panel' : true,
                'open' : this.state.expanded
            });
            var props = selectedSite.properties;
            var maxHeight = this.state.height;
            var bandeau = 'images/bandeaux/'+props.bandeau;
            
            return (
            <div className={contentClassName}>
                <div className="place-info-container">
                    <div className="place-info-content">
                        <div>
                           {this._formatHeader(selectedSite)}
                           <div className="place-info-inner" ref="inner" style={{'max-height': maxHeight, height: 'auto'}}>
                               <div className="place-info-middle">
                                   <div className="row">
                                       <div className="col-12">
                                        {
                                              this.DIV({
                                                  className: 'field addr',
                                                  key : 'addr'
                                              }, this.formatAddr(props))
                                         }
                                       </div>
                                   </div>
                                   <div className="row">
                                       <div className="col col-12">{this._formatLeftColumn(props)}</div>
                                   </div>
                                   {this._formatDescription(props)}
                               </div>
                               <div className="place-info-text">
                                   <div className="thumbs">
                                       <div className="row">
                                           <div className="col-12">
                                               <img src={bandeau} alt="" />
                                           </div>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       </div>
                    </div>
                </div>
            </div>
           ); 
        }
    });
   
   
});
 
