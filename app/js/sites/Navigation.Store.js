define(
// Dependencies
[ 'require', 'underscore', 'mosaic-commons', 'mosaic-core', './UrlParser' ],
// Module
function(require) {
    var _ = require('underscore');
    var Mosaic = require('mosaic-commons');
    var UrlParser = require('./UrlParser');

    var PLACEHOLDERS = {
        'activites' : 'toutes-les-activites'
    };

    /** This class is used as a provider of search criteria. */
    return Mosaic.App.Store.extend({
        displayName : 'NavigationStore',

        /** Internal methods and fields used by the Search.Module class */
        _initFields : function() {
            var that = this;
            that._sectors = {};
            that._sectorsIndex = {};
            that._sectorsByType = {};
            that._sectorsByName = {};
            that._sectorsByActivity = {};

            that._selectedCommerceId = null;

            that._searchCriteria = {};
            that._addActions([ 'search', //
            'updateSearchCriteria',//
            'selectSite', 'toggleSiteSelection' ]);
        },

        /** Returns an object containing the search criteria. */
        getSearchCriteria : function(copy) {
            var result = this._searchCriteria || {};
            if (copy) {
                result = JSON.parse(JSON.stringify(result));
            }
            return result;
        },

        /**
         * Returns an object containing internal search criteria transformed to
         * send to the server.
         */
        prepareSearchCriteriaForServer : function() {
            var result = _.extend({}, this._searchCriteria);
            return result;
            // var sector = this.getCategoryByKey(result.sectors);
            // if (sector) {
            // result.sectors = sector.name;
            // }
            // var activities = this.getCategoryByKey(result.activities);
            // if (activities) {
            // result.activities = activities.name;
            // }
            // return result;
        },

        /** Returns visible (editable) search criteria. */
        getVisibleSearchCriteria : function() {
            var criteria = this.getSearchCriteria();
            criteria = _.extend({}, criteria);
            delete criteria.entity;
            return criteria;
        },

        /** Checks and returns the given criteria. */
        checkSearchCriteria : function(criteria) {
            criteria = _.extend({}, criteria);
            if (!criteria.sectors) {
                delete criteria.sectors;
                delete criteria.activities;
            }
            if (!criteria.entity) {
                criteria.entity = this._searchCriteria.entity;
            }
            return criteria;
        },

        /** Returns all sectors. */
        getCategories : function() {
            return this._sectors;
        },

        /** Returns a unique key for the specified category */
        getCategoryKey : function(category) {
            if (!category) {
                return '';
            }
            return category.alias || category.name;
        },

        /**
         * Returns a category (sector or activity) corresponding to the
         * specified key.
         */
        getCategoryByKey : function(categoryKey) {
            return this._sectorsIndex[categoryKey];
        },

        /** Returns a category name corresponding to the specified category key. */
        getCategoryName : function(category) {
            if (_.isString(category)) {
                category = this.getCategoryByKey(category);
            }
            return category ? category.name : null;
        },

        /** Returns the currently selected site */
        getSelectedSite : function() {
            var id = this.getSelectedSiteId();
            if (!id)
                return null;
            var app = this.options.app;
            return app.sites.getSiteById(id);
        },

        /**
         * Returns <code>true</code> if the specified identifier corresponds
         * to a selected site.
         */
        isSelectedSite : function(id) {
            return this.getSelectedSiteId() == id;
        },

        /**
         * Returns the identifier of the selected site or <code>null</code> if
         * not sites were selected.
         */
        getSelectedSiteId : function() {
            return this._selectedCommerceId;
        },

        /**
         * Returns position of the selected site in the list.
         */
        getSelectedSitePos : function() {
            var id = this.getSelectedSiteId();
            if (!id)
                return -1;
            var app = this.options.app;
            return app.sites.getSitePositionById(id);
        },

        // ------------------------------------------------------------------
        // Private methods used internally by this class itself or by
        // the
        // corresponding Module class.

        /**
         * Sets the specified sectors and creates an index to fast access to
         * sectors by resource types.
         */
        _setCategories : function(sectors) {
            var that = this;
            that._sectors = _.filter(sectors, function(sector) {
                return sector.name != 'Commerce';
            });
            function index(category) {
                var key = that.getCategoryKey(category);
                that._sectorsIndex[key] = category;
                that._sectorsByType[category.type] = category;
                that._sectorsByName[category.name] = category;
            }
            _.each(that._sectors, function(category) {
                index(category);
                _.each(category.activities, function(activity) {
                    index(activity);
                    var key = that.getCategoryKey(activity);
                    that._sectorsByActivity[key] = category;
                });
            });
        },

        /**
         * Searches and returns a category object corresponding to the specified
         * type.
         */
        _getCategoryByType : function(type) {
            var result = null;
            var category = this._sectorsIndex[type];
            if (!category) {
                category = this._sectorsByType[type];
            }
            if (!category) {
                category = this._sectorsByName[type];
            }
            return category;
        },

        /**
         * Returns <code>true</code> if the specified search criteria object
         * contains some fields requiring re-launching the search request.
         */
        _hasNewSearchCriteria : function(criteria) {
            function toStr(c) {
                var results = _.extend({}, c);
                //delete results['department'];
                return JSON.stringify(results);
            }
            return toStr(this._searchCriteria) != toStr(this
                    ._cleanupCriteria(criteria));
        },

        /** Sets a new search criteria. */
        _setSearchCriteria : function(criteria) {
            this._searchCriteria = this._cleanupCriteria(criteria);
        },

        /** Select a site with the specified identifier. */
        _selectSiteById : function(siteId) {
            if (siteId && siteId !== '') {
                this._selectedCommerceId = siteId;
            } else {
                delete this._selectedCommerceId;
            }
            return this;
        },

        /** Toggles site selection for a site with the given id. */
        _toggleSiteById : function(siteId) {
            if (siteId === this.getSelectedSiteId()) {
                siteId = null;
            }
            this._selectSiteById(siteId);
        },


        /**
         * Creates a new copy of the specified criteria object with ordered and
         * filtered criteria fields.
         */
        _cleanupCriteria : function(criteria) {
            criteria = criteria || {};
            var result = {
                activities : criteria.activities,
                q : criteria.q
            };
            _.extend(result, criteria);
            
            if (this._isEmpty(result.sectors)) {
                delete result.activities;
            }


            _.each(result, function(val, key) {
                if (!val || val == '') {
                    delete result[key];
                }
            }, this);
            return result;
        },

        _isEmpty : function(o) {
            if (!o)
                return true;
            o += '';
            o = o.replace(/^[\r\n\s]+|[\r\n\s]+/gim, '');
            return o === '';
        },

    });

});