/**
 * @jsx React.DOM
 */
define(
// Dependencies
[ 'require', 'underscore', 'react', 'mosaic-core', 'mosaic-commons',
        './AppViewMixin', '../sites/EntityUrlParser', '../sites/UrlUtils',
        'text!../../content/about.html', 'text!../../content/embed.html',
        'text!../../content/contact.html',
        './AppDialogsMixin', 'jsx!./MainMenuPanel'],
// Module
function(require) {
    'use strict';
    var _ = require('underscore');
    var React = require('react');
    var Mosaic = require('mosaic-commons');
    var AppViewMixin = require('./AppViewMixin');
    var AppDialogsMixin = require('./AppDialogsMixin');
    var MainMenuPanel = require('jsx!./MainMenuPanel');
    var EntityUrlParser = require('../sites/EntityUrlParser');
    var UrlUtils = require('../sites/UrlUtils');
 
    return React.createClass({
        displayName : 'LeftZonePanel',
        mixins : [AppDialogsMixin],
        componentDidMount : function(){
            var parser = new EntityUrlParser();
            var urlUtils = new UrlUtils();
            var path = urlUtils._getCurrentPath(this.props.app);
            var criteria = parser.parseCriteria(path);
            if (criteria && (criteria.sectors || criteria.activities || criteria.cityAlias || criteria.department))
                return;
        },
        render : function() {
            return (
                <div className="zone-left">
                    <div className="header">
                        <a href="http://www.parisgalaxies.net" className="a-propos active" target="_blank">
                           <img src="images/logo-pga.png" style={{width: '80%', margin: '10% 10%', padding: '0px' }} alt="" />
                        </a>
                    </div>
                    <div className="left-menu">
                        <MainMenuPanel app={this.props.app} />
                    </div>
                </div>
            );
        },
    });

});
