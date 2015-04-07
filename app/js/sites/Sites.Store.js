define(
// Dependencies
[ 'require', 'underscore', 'mosaic-commons', 'mosaic-core' ],
// Module
function(require) {
    var _ = require('underscore');
    var Mosaic = require('mosaic-commons');

    /** This store is responsible for management of geographic zones. */
    return Mosaic.App.Store.extend({

        /** Initializes fields */
        _initFields : function() {
            var that = this;
            that._sites = [];
            that._addActions([ 'loadData' ]);
        },

        /** Returns a list of all sites. */
        getSites : function() {
            return this._sites;
        },

        /** Returns the total number of loaded sites. */
        getNumberOfSites : function() {
            return this._sites ? this._sites.length : 0;
        },

        /** Returns a unique identifier of the specified object. */
        getId : function(d) {
            if (!d)
                return null;
            if (d.id !== undefined)
                return d.id;
            var props = d.properties;
            props.id = props.id || _.uniqueId('id-');
            return props.id;
        },

        /** Returns tpe of the specified resource. */
        getType : function(resource) {
            var type = resource.properties.type || 'Organization';
            var array = type.split('/');
            return array[array.length - 1];
        },

        /** Returns an object by its identifier */
        getSiteById : function(siteId) {
            var result = null;
            _.find(this._sites, function(site, idx) {
                var id = this.getId(site);
                if (id == siteId) {
                    result = site;
                }
                return !!result;
            }, this);
            return result;
        },

        /**
         * Returns position in the list of an object with the specified
         * identifier.
         */
        getSitePositionById : function(siteId) {
            var result = null;
            _.find(this._sites, function(site, idx) {
                var id = this.getId(site);
                if (id == siteId) {
                    result = idx;
                }
                return !!result;
            }, this);
            return result;
        },

        /**
         * Sets the specified array of sites as in an internal field of this
         * object.
         */
        _setSites : function(sites) {
            this._sites = sites;
        },

    });

});