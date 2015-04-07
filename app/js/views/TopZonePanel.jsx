/**
 * @jsx React.DOM
 */
define(
// Dependencies
[ 'require', 'underscore', 'react', 'mosaic-core', 'mosaic-commons',
      './AppViewMixin', 'jsx!./MainMenuPanel', 'jsx!./TooltipPanel'   ],
// Module
function(require) {
    'use strict';
    var _ = require('underscore');
    var React = require('react');
    var Mosaic = require('mosaic-commons');
    var AppViewMixin = require('./AppViewMixin');
    var MainMenuPanel = require('jsx!./MainMenuPanel');
    var TooltipPanel = require('jsx!./TooltipPanel');
    
    return React.createClass({
        displayName : 'TopZonePanel',
        render : function(){
            return (
                <div className="zone-top">
                    <span className="title">PARIS GALAXIES</span>
                    <TooltipPanel className="menu"
                        activeClassName="menu active"
                        triggerClassName="menu-toggle right"
                        contentClassName="menu-content">
                        <div className="menu-pointer"></div>
                        <MainMenuPanel app={this.props.app} nobr={true} />
                    </TooltipPanel>
                </div>
            );
        },
    });
   
   
});
 