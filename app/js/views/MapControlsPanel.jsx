/**
 * @jsx React.DOM
 */
define(
// Dependencies
[ 'require', 'underscore', 'react', 'mosaic-core', 'mosaic-commons',
      './AppViewMixin', 'jsx!./TooltipPanel'  ],
// Module
function(require) {
    'use strict';
    var _ = require('underscore');
    var React = require('react');
    var Mosaic = require('mosaic-commons');
    var AppViewMixin = require('./AppViewMixin');
    var TooltipPanel = require('jsx!./TooltipPanel');
    
    return React.createClass({
        displayName : 'MapControlsPanel',
        _focusEntity : function(alias){
            this.props.app.ccis.actions.focusToEntity({ alias : alias });
        },

        _incZoom  : function(){
            var ui = this.props.app.ui;
            ui.actions.changeMapZoom({ zoomDelta : +1 });
        },
        _decZoom  : function(){
            var ui = this.props.app.ui;
            ui.actions.changeMapZoom({ zoomDelta : -1 });
        },
        
        _facebookShare : function() {
            var url = 'https://www.facebook.com/sharer/sharer.php?u=';
            url += encodeURIComponent(this.props.app.options.site);
            window.open(url, 'fbshare', 'width=640,height=320');
        },
        
        _googlePlusShare : function() {
            var url = 'https://plus.google.com/share?url=';
            url += encodeURIComponent(this.props.app.options.site);
            window.open(url, 'google-plus', 'width=640,height=520');
        },
        
        render : function(){
            return (
                <div className="map-controls">
                
                    <div className="control">
                        <div className="icon icon-carte-plus" onClick={this._incZoom}></div>
                    </div>
                    <div className="control">
                        <div className="icon icon-carte-moins" onClick={this._decZoom}></div>
                    </div>
                </div>
            );
        },
    });
   
});
 