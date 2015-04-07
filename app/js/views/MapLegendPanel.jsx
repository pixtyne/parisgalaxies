/**
 * @jsx React.DOM
 */
define(
// Dependencies
[ 'require', 'underscore', 'react', 'mosaic-core', 'mosaic-commons',
      './AppViewMixin', 'jsx!./PopupPanel' ],
// Module
function(require) {
    'use strict';
    var _ = require('underscore');
    var React = require('react');
    var Mosaic = require('mosaic-commons');
    var AppViewMixin = require('./AppViewMixin');
    var PopupPanel = require('jsx!./PopupPanel');
    
    return React.createClass({
        displayName : 'MapLegendPanel',
        getInitialState : function(){
            return this._newState();
        },
        _newState : function(options){
            return _.extend({
                showPopover : false
            }, this.state, options);
        },
        _closePopup : function(ev){
            PopupPanel.closePopup({app : this.props.app});
            if (ev){
                ev.stopPropagation();
                ev.preventDefault();
            }
        },        
        _onClosePopup :    function(ev) {
            ev.stopPropagation();
            ev.preventDefault();
        },
        _getPopupInfo : function(key){
            return POPUP_CONTENT[key];
        },
        _openPopup : function(key) {
            var info = this._getPopupInfo(key);
            var div = React.DOM.div({
                dangerouslySetInnerHTML: {__html: info.content}
            });
            PopupPanel.openPopup(_.extend({}, info, {
                app : this.props.app,
                onClose : this._onClosePopup
            }), div);
        },
        _getPopupHandler : function(key) {
            var that = this;
            return function(ev) {
                that._openPopup(key);
                ev.stopPropagation();
                ev.preventDefault();
            };
        },
        

        render : function(){
            return (
                <div className="map-legend">
                    <a href="http://www.openstreetmap.org/" target="_blank">&copy; OpenStreetMap</a>
                </div>
            );
        },
    });
   
});
 