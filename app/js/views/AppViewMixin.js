define(
// Dependencies
[ 'require', 'underscore' ],
// Module
function(require) {
    'use strict';
    var _ = require('underscore');
    return {
        getApp : function() {
            return this.props.app;
        },
        getInitialState : function() {
            return this._newState();
        },
        componentDidMount : function() {
            // this._onUpdate = _.debounce(this._onUpdate, 5);
            var store = this._getStore();
            store.addChangeListener(this._onUpdate);
        },
        componentWillUnmount : function() {
            var store = this._getStore();
            store.removeChangeListener(this._onUpdate);
        },
        _onUpdate : function() {
            if (this.isMounted()) {
                this.setState(this._newState());
                if (this._onStoreUpdate) {
                    this._onStoreUpdate();
                }
            }
        },
    };
});
