/**
 * @jsx React.DOM
 */
define(
// Dependencies
[ 'require', 'underscore', 'react', 'mosaic-core', 'mosaic-commons',
        './AppViewMixin' ],
// Module
function(require) {
    'use strict';
    var _ = require('underscore');
    var React = require('react');
    var Mosaic = require('mosaic-commons');
    var AppViewMixin = require('./AppViewMixin');

    return React.createClass({
        displayName : 'SearchResultsPanel',
        mixins : [ AppViewMixin ],
        render : function() {
            var store = this._getStore();
            var sites = store.getSites();
            var scrollStyle = this._getScrollSizeStyles();
            return Mosaic.Core.InfiniteScroll({
                className : this.props.className,
                style : scrollStyle,
                pageSize : 15,
                itemHeight : 75,
                length : sites.length,
                focusedIndex : this.state.focusedIndex,
                loadItems : this._renderItems
            });
        },
        setHeight : function(height) {
            var node = this.getDOMNode();
            this.setState(this._newState({
                height : height
            }));
        },
        _newState : function(options) {
            var nav = this.props.app.nav;
            var state = _.extend({
                expanded : true,
            }, this.state, {
                focusedIndex : nav.getSelectedSitePos(),
            }, options);
            var ui = this.props.app.ui;
            if (ui.isMobileMode()) {
                state.expanded = true;
            }
            return state;
        },
        _getStore : function() {
            return this.props.app.sites;
        },
        _getNavigation : function() {
            return this.props.app.nav;
        },
        _getUI : function() {
            return this.props.app.ui;
        },
        componentWillMount : function() {
            var that = this;
            this._updateHeight = _.debounce(this._updateHeight, 20);
            var nav = that._getNavigation();
            nav.addChangeListener(that._handleSelectedItem);
            this.setHeight = _.bind(this.setHeight, this);
        },
        componentWillUnmount : function() {
            var nav = this._getNavigation();
            nav.removeChangeListener(this._handleSelectedItem);
        },
        componentDidMount : function() {
            this._updateHeight();
        },
        componentWillUpdate : function() {
        },
        componentDidUpdate : function() {
            this._updateHeight();
        },
        _updateHeight : function() {
            var scrollStyle = this._getScrollSizeStyles();
            var node = this.getDOMNode();
            _.each(scrollStyle, function(val, key) {
                node.style[key] = val;
            }, this);
        },
        _handleSelectedItem : function() {
            var nav = this._getNavigation();
            var index = nav.getSelectedSitePos();
            var options = {};
            if (this.state.focusedIndex != index) {
                options.focusedIndex = index;
            }
            if (this.props.app.ui.isMobileMode()) {
                options.expanded = false;
            }
            this.setState(this._newState(options));

        },
        _selectItem : function(d, ev) {
            var store = this._getStore();
            var nav = this._getNavigation();
            var siteId = store.getId(d);
            nav.actions.toggleSiteSelection({
                siteId : siteId
            });
            ev.stopPropagation();
            ev.preventDefault();
        },
        _renderItem : function(d, i) {
            var store = this._getStore();
            var nav = this._getNavigation();
            var type = store.getType(d);
            var id = store.getId(d);
            var app = this.props.app;
            var selected = nav.isSelectedSite(id);
            var view = app.viewManager.newView('list', type, {
                app : app,
                data : d,
                pos : i,
                key : id,
                onClick : this._selectItem.bind(this, d),
                selected : selected
            });
            var result = view;
            return result;
        },
        _renderItems : function(params) {
            var that = this;
            var items = [];
            var store = that._getStore();
            var sites = store.getSites();
            for (var i = params.index; i < Math.min(params.index
                    + params.length, sites.length); i++) {
                items.push(that._renderItem(sites[i], i));
            }
            params.callback(items);
        },
        _getScrollSizeStyles : function() {
            var height = this.state.height;
            height = this.state.height;
            var style = {
                maxHeight : height + 'px',
                'overflow-x' : 'hidden'
            };
            var ui = this._getUI();
            if (ui.isMobileMode()) {
                style.height = height + 'px';
            }
            return style;
        },
    });

});
