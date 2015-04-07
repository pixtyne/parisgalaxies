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
        displayName : 'SearchInputPanel',

        mixins : [ AppViewMixin ],
        
        componentWillMount : function() {
          this._doSubmit = _.debounce(this._doSubmit, 500);  
            
        },

        _newState : function(options) {
            var store = this._getStore();
            var criteria = store.getSearchCriteria();
            var q = criteria.q;
            var state = _.extend({
                q : q
            }, this.state, options);
            return state;
        },

        _getStore : function() {
            return this.props.app.nav;
        },
        
        _doSubmit : function() {
            this._runSearch();
        },
        _runSearch : function() {
            var that = this;
            var value = that.state.q;
            var store = that._getStore();
            var searchCriteria = store.getSearchCriteria(true);
            searchCriteria.q = value;
            store.actions.updateSearchCriteria(searchCriteria);
        },
        _updateSearchCriteria : function(ev){
            var value = ev.target.value;
            this.setState(this._newState({q : value}));
            this._doSubmit();
        },        
        
        _handleClear : function(ev) {
            this.setState(this._newState({q : ''})); 
            this._doSubmit();
        },
        
        _handleKeyDown : function(ev) {
            var clear = false;
            if (ev.which === 9) { // Tab
                this._runSearch();
                clear = true;
            } else if (ev.which === 13) { // Enter
                this._runSearch();
                clear = true;
            } else if (ev.which == 27) { // Esc
                this._handleClear();
            }
            if (clear) {
                ev.preventDefault();
                ev.stopPropagation();
            }
        },        
        /** Main rendering method of this class. */
        render : function() {
            var app = this.props.app;
            var cssClass = this.props.className || 'filter-box';
           // var inputSize = this._getInputSize(value);
            return (
                <div className="search-input-container">
                    <div className="search-input">
                        <input type="text" ref='input' 
                            value={this.state.q}
                            onKeyDown={this._handleKeyDown}
                            onChange={this._updateSearchCriteria}
                        />
                    </div>
                    <div className="icon-reset" onClick={this._handleClear}></div>
                    <div className="icon-loupe"></div>
                </div>
                );
            
            
        },
    });

});
