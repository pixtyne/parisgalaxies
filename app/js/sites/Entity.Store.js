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
            that._entities = [];
            that._entityIndex = [];
            that._addActions([ 'focusToEntity' ]);
        },

        /** Returns a list of all entities. */
        getEntities : function() {
            return this._entities;
        },

        /**
         * Sets the specified array of entities as in an internal field of this
         * object.
         */
        _setEntities : function(list) {
            this._entities = list;
            _.each(this._entities, function(entity) {
                var alias = entity.alias;
                this._entityIndex[alias] = entity;
            }, this);
        },

        /**
         * Returns a bounding box for an entity corresponding to the specified
         * alias.
         */
        getBoundingBox : function(alias) {
            var bounds = [];
            var entityKeys = [ alias ];
            var defined = false;
            if (alias == 'entity-fr') {
                _.each(this._entities, function(entity) {
                    if (entity.alias === 'entity-spm') {
                        return;
                    }
                    var coords = entity.geometry.coordinates;
                    this._extendBounds(bounds, coords);
                    defined = true;
                }, this);
            } else {
                var entity = this._entityIndex[alias];
                if (entity) {
                    defined = true;
                    var coords = entity.geometry.coordinates;
                    this._extendBounds(bounds, coords);
                }
            }
            if (defined) {
                this._expandBounds(bounds);
            } else {
                //bounds = [ [ -90, -180 ], [ 90, 180 ] ];
                //SL
                bounds = [ [ 1.45, 49.00  ], [ 2.35,48.58 ] ];
            }
            
            
            return bounds;
        },

        _expandBounds : function(bounds) {
            var precision = 1 / 100;
            bounds[0][0] = Math.floor(bounds[0][0] / precision) * precision;
            bounds[0][1] = Math.floor(bounds[0][1] / precision) * precision;
            bounds[1][0] = Math.ceil(bounds[1][0] / precision) * precision;
            bounds[1][1] = Math.ceil(bounds[1][1] / precision) * precision;
        },

        _extendBounds : function(bounds, coords) {
            if (_.isArray(coords[0])) {
                _.each(coords, function() {
                    this._extendBounds(bounds, coords[0]);
                }, this);
            } else {
                this._extendBoundsWithPoint(bounds, coords);
            }
        },

        _extendBoundsWithPoint : function(bounds, point) {
            if (!_.isArray(bounds[0])) {
                bounds[0] = [ point[0], point[1] ];
                bounds[1] = [ point[0], point[1] ];
            } else {
                bounds[0][0] = Math.min(point[0], bounds[0][0]);
                bounds[0][1] = Math.min(point[1], bounds[0][1]);
                bounds[1][0] = Math.max(point[0], bounds[1][0]);
                bounds[1][1] = Math.max(point[1], bounds[1][1]);
            }
        }

    });

});