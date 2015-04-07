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
        displayName : 'SearchCategoriesPanel',

        mixins : [ AppViewMixin ],

        _newState : function(options) {
            var store = this._getStore();
            var state = _.extend({
                height : '400px'
            }, this.state, options);
            return state;
        },
        _getStore : function() {
            return this.props.app.sites;
        },
        _renderCategory : function(level, category, criteria, subcategories) {
            var className=  "item level-" + level;
            var key = (category.type + '-' + category.name) + '-' + level;
            var icon = category.icon ? (<i className={'icon ' + category.icon}></i>) : '';
            var listener = _.bind(this.props.onSelect, this, criteria);
            return (
                <div key={key} className={className} onClick={listener}>
                    <a className="item-label" href="#" onClick={listener}>
                        {icon}
                        <span className="name">{category.name}</span>
                    </a>
                    {subcategories}
                </div>
            );
        },
        _renderSectors : function(){
            var app = this.props.app;
            var sectors = app.nav.getCategories();
            var nav = this.props.app.nav;
            var result = _.map(sectors, function(sector) {
                var criteria = {
                    'sectors' : nav.getCategoryKey(sector) 
                };
                var activities = _.map(sector.activities||[], function(activity) {
                    var activityCriteria = _.extend({}, criteria, {
                        'activities': nav.getCategoryKey(activity)
                    });
                    //return this._renderCategory(1, activity, activityCriteria);
                }, this);
                
                if (sector.alias == 'toutes-les-activites')
                    activities = '';
                return this._renderCategory(0, sector, criteria, activities);
            }, this);
            return result;
        },
        render : function() {
            var store = this._getStore();
            var style = {
                maxHeight : this.state.height,
                'overflow-x' : 'hidden'
            };
            return (
                <div className="categories" style={style}>
                    {this._renderSectors()}
                </div>
            );
        },
    });

});
