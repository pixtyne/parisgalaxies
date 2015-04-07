/**
 * @jsx React.DOM
 */
define(
// Dependencies
[ 'require', 'underscore', 'react' ],
// Module
function(require) {
    'use strict';
    var _ = require('underscore');
    var React = require('react');
    var TooltipPanel = React.createClass({
        displayName : 'TooltipPanel',
        render : function() {
            var className = this.props.className || 'popover';
            if (this.state.showPopover) {
                className = this.props.activeClassName || //
                className + ' active';
            }
            var triggerClassName = this.props.triggerClassName
                    || 'popover-trigger';

            return React.DOM.div({
                className : className
            }, React.DOM.div({
                className : triggerClassName,
                onMouseEnter : this._cancelSwitchOff,
                onMouseLeave : this._switchPopoverOff,
                onClick : this._switchPopover
            }), this._renderContent());
        },
        _renderContent : function() {
            if (!this.state.showPopover)
                return '';
            var contentClassName = this.props.contentClassName || //
            'popover-content';
            return React.DOM.div({
                className : contentClassName,
                onMouseEnter : this._switchPopoverOn,
                onMouseLeave : this._switchPopoverOff,
            }, this.props.children);
        },
        getInitialState : function() {
            return this._newState();
        },
        _newState : function(options) {
            return _.extend({
                showPopover : false
            }, this.state, options);
        },
        _cancelSwitchOff : function() {
            var that = this;
            if (that._cancelTimeout) {
                clearTimeout(that._cancelTimeout);
                delete that._cancelTimeout;
            }
        },
        _switchPopoverOn : function() {
            this._cancelSwitchOff();
            this.setState(this._newState({
                showPopover : true
            }));
        },
        _switchPopoverOff : function() {
            var that = this;
            that._cancelSwitchOff();
            that._cancelTimeout = setTimeout(function() {
                that.setState(that._newState({
                    showPopover : false
                }));
            }, 500);
        },
        _switchPopover : function() {
            this.setState(this._newState({
                showPopover : !this.state.showPopover
            }));
        },
    });

    return TooltipPanel;

});
