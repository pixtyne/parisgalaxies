/**
 * @jsx React.DOM
 */
define(
// Dependencies
[ 'require', 'underscore', 'react', './AppViewMixin',
   'jsx!./LeftZonePanel', 'jsx!./TopZonePanel','jsx!./RightZonePanel',
    'jsx!./PopupPanel', 'jsx!./GAInitializer', './AppViewMixin'
   ],
// Module
function(require) {
    'use strict';
    var _ = require('underscore');
    var React = require('react');
    
    var LeftZonePanel = require('jsx!./LeftZonePanel');
    var TopZonePanel = require('jsx!./TopZonePanel');
    var RightZonePanel = require('jsx!./RightZonePanel');
    var PopupPanel = require('jsx!./PopupPanel');
    var GAInitializer = require('jsx!./GAInitializer');
    
    var AppViewMixin = require('./AppViewMixin');
    return React.createClass({
        mixins : [AppViewMixin],
        displayName : 'MainView',
        _newState : function(options) {
            var app = this.props.app;
            return _.extend({}, this.state, {
                bigFormat : !app.ui.isMobileMode()
            }, options);
        },
        _getStore : function(){
            return this.props.app.ui;
        },
        _onChangeFormat : function(e){
            var app = this.props.app;
            app.ui.actions.setMobileMode({
                mobileMode : !app.ui.isMobileMode()
            });
            e.preventDefault();
            e.stopPropagation();
        },
        _renderBottomZone : function(){
            //see also @bottom-zone: 0px; in main.less
            return '';
//            return (
//               <div className="zone-bottom">
//                   <a href="#"  onClick={this._onChangeFormat}>Change format</a>
//               </div>
//            );
        },
        _renderGoogleAnalytics : function() {
            ga('create', 'UA-36939074-7', 'auto');
            ga('send', 'pageview');
        },
        render: function() {
            var app = this.props.app;
            var className = 'cci-preference-commerce';
            if (this.state.bigFormat){
                className += ' cci-big-screen';
            } else {
                className += ' cci-small-screen';
            }
            return (
                <div className={className}>
                    <TopZonePanel app={app}/>
                    <LeftZonePanel app={app} />
                    <RightZonePanel app={app} />
                    <PopupPanel.Container app={app} />
                    {this._renderBottomZone()}
                    {this._renderGoogleAnalytics()}
                    <GAInitializer />
                 </div>
            );
        }
    });
});
 