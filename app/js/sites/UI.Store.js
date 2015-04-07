define(
// Dependencies
[ 'require', 'underscore', 'mosaic-commons', 'mosaic-core' ],
// Module
function(require) {
    var _ = require('underscore');
    var Mosaic = require('mosaic-commons');

    /** This store contains various elements used by UI */
    return Mosaic.App.Store.extend({

        /** Initializes fields */
        _initFields : function() {
            this._icons = {};
            this._activeIcons = {};
            this._mobileMode = this.options.isMobile;
            this._mapBoundingBox = [ [ -90, -180 ], [ 90, 180 ] ];

            this._mapZoomLevel = this.getInitialMapZoom();
            this._addActions([ 'changeMapZoom', 'setMobileMode' ]);
        },

        /** Returns the name of the icon to use with the specified type. */
        getCategoryIconName : function(type) {
            var category = this._getCategoryByType(type);
            return category ? category.icon : '';
        },

        /** Returns an icon corresponding to the specified type. */
        getCategoryIcon : function(type) {
            var category = this._getCategoryByType(type);
            var key = this.options.app.nav.getCategoryKey(category);
            return this._icons[key];
        },

        /** Returns an icon for selected elements of the specified type. */
        getSelectedCategoryIcon : function(type) {
            var category = this._getCategoryByType(type);
            var key = this.options.app.nav.getCategoryKey(category);
            return this._activeIcons[key];
        },

        /** Returns options for tiles layer */
        getMapTilesOptions : function() {
            var mapOptions = this.getMapOptions();
            var tilesUrl = mapOptions.tilesUrl;
            var maxZoom = mapOptions.maxZoom;
            var minZoom = mapOptions.minZoom;
            var attribution = mapOptions.attribution;
            return {
                attribution : attribution,
                maxZoom : maxZoom,
                minZoom : minZoom,
                tilesUrl : tilesUrl
            };
        },

        /** Returns the current zoom level of the map. */
        getMapZoomLevel : function() {
            return this._mapZoomLevel;
        },

        /** Returns initial coordinates where the map should be focused. */
        getInitialMapCenter : function() {
            var mapOptions = this.getMapOptions();
            return mapOptions.center || [ 2, 48 ]; // Somewhere in France...
        },

        /** Returns the initial zoom level for the map. */
        getInitialMapZoom : function() {
            var mapOptions = this.getMapOptions();
            return mapOptions.zoom || 8;
        },

        /** Returns an object of map-specific options of this application. */
        getMapOptions : function() {
            var app = this.options.app;
            var mapOptions = app.options.map;
            return mapOptions;
        },

        /** Returns map bounding box. */
        getMapBoundingBox : function() {
            return this._mapBoundingBox;
        },

        /** Add a new listener for map changes. */
        addMapChangeListener : function(listener, context) {
            this.on('map:change', listener, context);
        },
        /** Removes the specified listener of map changes. */
        removeMapChangeListener : function(listener, context) {
            this.off('map:change', listener, context);
        },

        /** Add a new listener for map zoom changes. */
        addMapZoomListener : function(listener, context) {
            this.on('map:zoom', listener, context);
        },
        /** Removes the specified listener of map zoom changes. */
        removeMapZoomListener : function(listener, context) {
            this.off('map:zoom', listener, context);
        },

        /** Sets icons for categories. */
        _setCategoryIcons : function(icons, activeIcons) {
            this._icons = icons;
            this._activeIcons = activeIcons;
        },

        /**
         * Returns <code>true</code> if this application is in mobile mode.
         */
        isMobileMode : function() {
            return !!this._mobileMode;
        },

        /**
         * Notifies about changes on the map. Used internally by the Module
         * class.
         */
        _notifyMapChanges : function() {
            this.fire('map:change');
        },
        /**
         * Notifies about changes on the map. Used internally by the Module
         * class.
         */
        _notifyMapZoom : function() {
            this.fire('map:zoom');
        },

        /** Updates the zoom level. Used internally by the Module class. */
        _setMapZoomLevel : function(zoom) {
            this._mapZoomLevel = Math.max(3, Math.min(zoom, 18));
        },

        /** Sets mobile mode. */
        _setMobileMode : function(mobileMode) {
            this._mobileMode = !!mobileMode;
        },

        /** Returns a category object corresponding to the specified key. */
        _getCategoryByType : function(type) {
            var app = this.options.app;
            var category = app.nav._getCategoryByType(type);
            return category;
        },

        /** Sets a new map bounding box. */
        _setMapBoundingBox : function(bbox) {
            this._mapBoundingBox = bbox;
        },

    });

});