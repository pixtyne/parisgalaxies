/**
 * @jsx React.DOM
 */
define(
// Dependencies
[ 'require', 'underscore', 'react', 'mosaic-core', 'mosaic-commons', './AppViewMixin', 'jsx!./PopupPanel',
        'text!../../content/about.html', 'text!../../content/embed.html',
        'text!../../content/contact.html', 'jsx!./SearchBoxPanel'],
// Module
function(require) {
    'use strict';
    var _ = require('underscore');
    var React = require('react');
    var Mosaic = require('mosaic-commons');
    var AppViewMixin = require('./AppViewMixin');
    var PopupPanel = require('jsx!./PopupPanel');
    var SearchBoxPanel = require('jsx!./SearchBoxPanel');
    var POPUP_CONTENT = {
        'about' : {
            content : require('text!../../content/about.html'),
            className : 'modal-about'
        },
        'embed' : {
            content : require('text!../../content/embed.html'),
            className : 'modal-engage'
        },
        'contact' : {
            content : require('text!../../content/contact.html'),
            className : 'modal-engage'
        },
    };

    var HtmlPanel = React.createClass({
        displayName : 'HtmlPanel',
        render : function() {
            return React.DOM.div({
                className : this.props.className,
                dangerouslySetInnerHTML : {
                    __html : this.props.content
                }
            });
        },
        componentDidMount : function() {
            this.processHtml();
        },
        componentDidUpdate : function() {
            this.processHtml();
        },
        processHtml : function() {
            if (this.props.processHtml) {
                this.props.processHtml.apply(this);
            }
        }
    });

    var AppDialogsMixin = {
        _closePopup : function(ev) {
            PopupPanel.closePopup({
                app : this.props.app
            });
            if (ev) {
                ev.stopPropagation();
                ev.preventDefault();
            }
        },
        _onClosePopup : function(ev) {
            ev.stopPropagation();
            ev.preventDefault();
        },
        _getPopupInfo : function(key) {
            return POPUP_CONTENT[key];
        },
        _openPopup : function(key) {
            var info = this._getPopupInfo(key);
            var options = _.extend({
                onClose : this._closePopup
            }, info, this.props);
            var panel = new HtmlPanel(options);
            PopupPanel.openPopup(_.extend({}, info, {
                app : this.props.app,
                onClose : this._onClosePopup
            }), panel);
        },
        _getPopupHandler : function(key) {
            var that = this;
            return function(ev) {
                that._openPopup(key);
                if (ev) {
                    ev.stopPropagation();
                    ev.preventDefault();
                }
            };
        },
    };

    return AppDialogsMixin;

});
