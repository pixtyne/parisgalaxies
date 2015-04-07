/** @jsx React.DOM */
define(
// Dependencies
[ 'require', 'underscore', 'mosaic-commons', 'mosaic-core', 'react', './AppViewMixin', 
        'jsx!./SearchCategoriesPanel', 'jsx!./SearchInputPanel' ],
// Module
function(require) {
    'use strict';
    var _ = require('underscore');
    var React = require('react');
    var AppViewMixin = require('./AppViewMixin');
    var Mosaic = require('mosaic-commons');
    var CategoriesPanel = require('jsx!./SearchCategoriesPanel');
    var SearchInputPanel = require('jsx!./SearchInputPanel');

    return React.createClass({
        displayName : 'SearchBoxPanel',
        mixins : [ AppViewMixin, Mosaic.React.SearchBoxMixin ],

        /**
         * This method copies the search criteria from the search store to the
         * filter box.
         */ 
        componentWillMount : function() {
            var that = this;
            that._runSearch = _.debounce(that._runSearch, 50);
            that._showSearchCriteria();
            
            var store = this._getStore();
            var searchCriteria = store.getVisibleSearchCriteria();
            that.setState(that._newState({criteria : searchCriteria}));
            var model = that._getFilterBoxModel();
            model.on('focus', function(focused){
                that.setState(that._newState({inputFocused : focused}));
            });
        },
        
        /**
         * This method is called by the Mosaic.React.SearchBoxMixin when model
         * of the search box changes. This method invokes the search intent
         * using criteria from the filter box.
         */
        _onSearchCriteriaChanged : function(criteria) {
            this._runSearch(criteria);
        },

        /** Runs a new search operation with the specified search criteria. */
        _runSearch : function(criteria){
            var nav = this.props.app.nav;
            criteria = nav.checkSearchCriteria(criteria);
            var store = this._getStore();
            store.actions.updateSearchCriteria(criteria);
        },
        
        /**
         * This method invokes the search intent using criteria from the filter
         * box.
         */
        _submitSearch : function(ev) {
            var criteria = this.getSearchCriteria();
            this._runSearch(criteria);
            if (this.props.onSubmit){
                this.props.onSubmit(ev);
            }
            if (ev) {
                ev.preventDefault();
                ev.stopPropagation();
            }
        },
        
        /**
         * This method reflects the search criteria defined in the store.
         */
        _showSearchCriteria : function(){
            var store = this._getStore();
            var searchCriteria = store.getVisibleSearchCriteria();
            this.setSearchCriteria(searchCriteria);
        },
        
        /**
         * This method is called by the AppViewMixin when the content of the
         * underlying store changes.
         */ 
        _onStoreUpdate : function(ev){
            this._showSearchCriteria();
        },
        
        /**
         * Creates and returns a new state. This method is expected by the
         * AppViewMixin mixin.
         */
        _newState : function(options) {
            var store = this._getStore();
            var searchCriteria = store.getSearchCriteria();
            return _.extend({
                closedCategories : true,
                closedGeography : true,
                inputFocused : false,
                searchCriteria : searchCriteria
            }, this.state, options);
        }, 
        
        /**
         * Returns the internal store managing the view data. This method is
         * expected by the AppViewMixin mixin.
         */
        _getStore : function() {
            return this.props.app.nav;
        },

        /** Switch on/off the categories panel. */
        _switchCategoriesPanel : function(ev){
            var that = this;
            var closed = !that.state.closedCategories;
            that.setState(that._newState({
                closedCategories : closed,
                closedGeography : true
            }));
            ev.preventDefault();
        },

        /**
         * Returns <code>true</code> if the categories panel should be
         * visible.
         */
        _isCategoriesPanelVisible : function(){
            return !this.state.closedCategories;
        },
        
        /** Selects the specified category */
        _onSelectCategory : function(criteria, ev){
            var store = this._getStore();
            criteria = _.extend({}, store.getSearchCriteria(), {
                sectors : criteria.sectors,
                activities : criteria.activities,
            }); 
            this._runSearch(criteria);
            this.setState(this._newState({
                closedCategories : true,
                criteria: criteria
            }));
            ev.preventDefault();
            ev.stopPropagation();
        },
        
       
        
        _onSelectText : function(arg1, arg2) {
           console.log('>> SELECT TEXT');
           console.log(arg1);
           console.log(arg2);
           ev.preventDefault();
           ev.stopPropagation();
        },
        
        /** Renders the categories block. */
        _renderCategoriesPanel : function(){
            if (!this._isCategoriesPanelVisible())
                return '';
            var app = this.props.app;
            return ( 
               <CategoriesPanel app={app} ref="categories" onSelect={this._onSelectCategory} />
            );
        },
        
        /** Creates and returns a new model for the search box. */
        _newFilterModel : function(){
            var that = this;
            var nav = that.props.app.nav;
            return new Mosaic.React.SearchBoxMixin.Model({
                newFilterValue : function(value, key){
                    var result = {
                        key : key || this.getDefaultField(),
                        label : value
                    };
                    var category = nav.getCategoryByKey(value);
                    if (category) {
                        result.label = nav.getCategoryName(category);
                        result.category = category;
                        result.categoryKey = value;
                        if (value !== 'q') {
                            result.className = 'category ' + value;
                        }
                    }
                    return result;
                },
                newSearchValue : function(obj, key) {
                    if (obj.categoryKey)
                        return obj.categoryKey;
                    return obj.label;
                },
            });
        },
        
        /**
         * Main rendering method of this class.
         */
        render : function() {
            var categoriesBtnStyle = 'search-categories';
            if (this._isCategoriesPanelVisible()) {
                categoriesBtnStyle += ' active';
            }
            if (this.state.criteria && this.state.criteria.sectors) {
                categoriesBtnStyle += ' '+this.state.criteria.sectors;
            }
           
            var className = this.props.className || 'search-box';
            
            var criteria = this.state.criteria;
            //needed to add the cci criteria 
            criteria  = this._getStore().checkSearchCriteria(criteria);
            console.log('>> CRITERIA', criteria);

            var nav = this.props.app.nav;
            var geo = this.props.app.geo;
            var activityFilterLabel = 'Filtrer par catégorie';
            if (criteria) {
                if (criteria.sectors) {
                    var sectorLabel = nav.getCategoryName(criteria.sectors);
                    var subActivityLabel = '';
                    if (criteria.activities) {
                        subActivityLabel = ' - ' + nav.getCategoryName(criteria.activities);
                    }
                    activityFilterLabel = sectorLabel + subActivityLabel;
                }
               
            }
            
            if (criteria.entity != 'entity-fr') {
                
                return (
                        <div className={className}>
                            <div className={categoriesBtnStyle} onClick={this._switchCategoriesPanel}>
                                <a href="#" className="filter">{activityFilterLabel}</a>
                                {this._renderCategoriesPanel()}
                            </div>
                            <SearchInputPanel app={this.props.app} />
                       </div>
                );
                
            } else 
            
            return (
                    <div className={className}>
                        <div className={categoriesBtnStyle} onClick={this._switchCategoriesPanel}>
                            <a href="#" className="filter">{activityFilterLabel}</a>
                            {this._renderCategoriesPanel()}
                        </div>
                        <SearchInputPanel app={this.props.app} />
                   </div>
            );
        },
        
    });

});
