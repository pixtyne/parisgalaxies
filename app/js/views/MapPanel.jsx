/**
 * @jsx React.DOM
 */
define(
// Dependencies
[ 'require', 'underscore', 'react', 'mosaic-core', 'mosaic-commons', 'leaflet',
        'leaflet.datalayer', './AppViewMixin' ],
// Module
function(require) {
    'use strict';
    var _ = require('underscore');
    var React = require('react');
    var Mosaic = require('mosaic-commons');
    var AppViewMixin = require('./AppViewMixin');
    var LeafletDataLayer = require('leaflet.datalayer');
    var L = require('leaflet');

    /** This class is used to visualize organizations on the map. */
    var OrganizationsRenderer = LeafletDataLayer.MarkersRenderer.extend({
        initialize : function(options) {
            LeafletDataLayer.MarkersRenderer.prototype.initialize.apply(this,
                    arguments);
            L.setOptions(this, options);
        },
        _getResourceType : function(resource) {
            var app = this._getApp();
            return app.sites.getType(resource);
        },
        _getApp : function() {
            return this.options.app;
        },
        _drawIcon : function(type) {
            var radius = this._getRadius();
            var canvas = document.createElement('canvas');

            var lineWidth = this._getVal('lineWidth', 0);
            canvas.height = radius * 2;
            canvas.width = radius * 2;
            
            radius -= lineWidth;

            var g = canvas.getContext('2d');
            //g.fillStyle = this._getVal('fillColor', 'orange');
            g.globalAlpha = this._getVal('fillOpacity', 1);
            g.strokeStyle = this._getVal('lineColor', 'gray');
            g.lineWidth = lineWidth;
            g.lineCap = 'round';
            switch (type) {
                case 'Architecture (urbanisme)':
                    g.fillStyle =  '#560b4d';
                    break;
                case 'Monument':
                    g.fillStyle =  '#560b4d';
                    break;
                case 'Patrimoine':
                    g.fillStyle =  '#560b4d';
                    break;
                case 'Musee et patrimoine':
                    g.fillStyle =  '#560b4d';
                    break;
                case 'Arts visuels':
                    g.fillStyle =  '#d62fe8';
                    break;
                case 'Art contemporain':
                    g.fillStyle =  '#d62fe8';
                    break;
                    
                case 'Cinema':
                    g.fillStyle =  '#a95460';
                    break;   
                case 'Spectacle vivant':
                    g.fillStyle =  '#ef3926';
                    break;
                case 'Spectacle vivante':
                    g.fillStyle =  '#ef3926';
                    break;
                case 'Food':
                    g.fillStyle =  '#dae02c';
                    break;
                case 'Fooding':
                    g.fillStyle =  '#dae02c';
                    break;
                case 'Musique':
                    g.fillStyle =  '#f3962b';
                    break;
                case 'Design':
                    g.fillStyle =  '#857f66';
                    break;
                case 'Innovation':
                    g.fillStyle =  '#857f66';
                    break;
                case 'Education':
                    g.fillStyle =  '#eafda2';
                    break;                           
            }


            var zoom = this._map.getZoom();
            var image = this.options.getIcon ? this.options.getIcon(type, zoom)
                    : null;
            var x = radius + lineWidth;
            var y = radius + lineWidth;

            g.beginPath();
            //g.arc(x, y, radius, 0, Math.PI * 2);
            
            g.moveTo(radius, 2*radius);
            g.lineTo(radius/2, radius/2);
            g.lineTo(radius, radius/2);
            g.lineTo(radius*1.5, 0);
            g.closePath();
            g.fill();
            g.stroke();
            
            if (radius > 4) {
                g.shadowColor = '#999';
                g.shadowBlur = lineWidth;
                g.shadowOffsetX = lineWidth / 2;
                g.shadowOffsetY = lineWidth / 2;
            }
            g.fill();

            if (radius >= 8 && image) {
                var d = radius * 2;
                g.drawImage(image, lineWidth, lineWidth, d, d);
            } else {
                if (lineWidth) {
                    g.shadowColor = 'none';
                    g.shadowBlur = 0;
                    g.shadowOffsetX = 0;
                    g.shadowOffsetY = 0;
                    g.stroke();
                }
            }
            return {
                image : canvas,
                anchor : L.point(canvas.width / 2, canvas.height)
            };
        }
    });

    return React.createClass({
        displayName : 'MapPanel',
        render : function() {
            var className = 'map-panel';
            return (Mosaic.Leaflet.ReactMap({
                options : {
                    zoomControl : false,
                    attributionControl : false
                },
                className : className,
                onMapAdd : this._onMapAdd,
                onMapRemove : this._onMapRemove
            }));
        },

        /** Returns the underlying application */
        _getApp : function() {
            return this.props.app;
        },

        setViewport : function(bounds) {
            this._viewport = L.bounds(L.point(bounds[0]), L.point(bounds[1]));
            if (!this._focusPos) {
                this._focusPos = this._viewport.getCenter();
            }
        },
        setFocusPosition : function(pos) {
            this._focusPos = L.point(pos.left, pos.top);
        },

        setCenterPosition : function(pos) {
            this._centerPos = L.point(pos.left, pos.top);
        },

        _getViewportPadding : function() {
            var min = this._viewport.min;
            var size = this._map.getSize();
            var max = size.subtract(this._viewport.max);
            return L.bounds(min, max);
        },

        _fitBounds : function(bounds) {
            var options = {};
            if (this._viewport) {
                var padding = this._getViewportPadding();
                options.paddingTopLeft = padding.min;
                options.paddingBottomRight = padding.max;
            }
            this._map.fitBounds(bounds, options);
        },

        _panTo : function(coords, focusPos) {
            var that = this;
            return Mosaic.P.then(function() {
                if (focusPos) {
                    var focus = that._map._getTopLeftPoint();
                    focus._add(focusPos);
                    var shift = that._map.project(coords).subtract(focus);
                    that._map.panBy(shift);
                } else {
                    that._map.panTo(coords);
                }
            });
        },

        _focusTo : function(coords, focusPos) {
            return this._panTo(coords, this._focusPos);
        },

        _zoomTo : function(zoom) {
            var that = this;
            return Mosaic.P.then(function() {
                var map = that._map;
                if (map.getZoom() == zoom)
                    return;
                var deferred = Mosaic.P.defer();
                map.once('zoomend', deferred.resolve);
                map.setZoom(zoom);
                return deferred.promise;
            });
        },

        _panInsideBounds : function(bounds) {
            var that = this;
            var map = that._map;
            var zoom = map.getBoundsZoom(bounds) - 2;
            return Mosaic.P.then(function() {
                return that._zoomTo(zoom);
            }).then(function() {
                var center = map.getCenter();
                var newCenter = map._limitCenter(center, zoom, bounds);
                if (!center.equals(newCenter)) {
                    return that._panTo(newCenter, that._centerPos);
                }
            });
        },

        /**
         * This method is called by the Mosaic.Leaflet.ReactMap to notify that
         * the map was attached to the DOM.
         */
        _onMapAdd : function(map) {
            map.on('click', function(e) {
                console.log(map.getZoom() + ':[' + e.latlng.lng + ','
                        + e.latlng.lat + ']');
            });
            this._addTilesLayer(map);
            this._initMarkers(map);
            this._initSelectedMarkers(map);
            this._registerHandlers(map);
            this._initializeMapView(map);
            this._redrawMarkers();
        },
        /**
         * This method is called by the Mosaic.Leaflet.ReactMap to notify that
         * the map component was removed.
         */
        _onMapRemove : function(map) {
            this._removeHandlers(map);
            this._removeSelectedMarkers(map);
            this._removeMarkers(map);
        },

        /**
         * Returns map options from the global application options.
         */
        _getMapOptions : function() {
            var app = this._getApp();
            return app.ui.getMapOptions();
        },

        /** Adds tiles layer to the map. */
        _addTilesLayer : function(map) {
            var app = this._getApp();
            var options = app.ui.getMapTilesOptions();
            var tilesLayer = L.tileLayer(options.tilesUrl, options);
            map.addLayer(tilesLayer);
        },

        /** Initializes the initial map view. */
        _initializeMapView : function(map) {
            this._updateMapPosition();
        },

        /**
         * Registers handlers (listeners) responsible for marker redrawing and
         * selected item highlighting.
         */
        _registerHandlers : function(map) {
            this._map = map;

            if (!this._debouncedZoomListeners) {
                // FIXME: check that there is no performance issues
                var timeout = 50;
                this._onZoomEnd = _.debounce(this._onZoomEnd, timeout);
                this._updateMapPosition = _.debounce(this._updateMapPosition,
                        timeout);
                this._updateMapZoom = _.debounce(this._updateMapZoom, timeout);
                this._debouncedZoomListeners = true;
            }

            var app = this._getApp();
            app.sites.addChangeListener(this._redrawMarkers);
            app.nav.addChangeListener(this._updateSelectionMarker);
            app.ui.addMapChangeListener(this._updateMapPosition, this);
            app.ui.addMapZoomListener(this._updateMapZoom, this);
            map.on('zoomend', this._onZoomEnd, this);
        },

        /**
         * Removes handlers (listeners) responsible for marker redrawing and
         * selected item highlighting.
         */
        _removeHandlers : function(map) {
            var app = this._getApp();
            map.off('zoomend', this._onZoomEnd, this);
            app.ui.removeMapChangeListener(this._updateMapPosition, this);
            app.ui.removeMapZoomListener(this._updateMapZoom, this);
            app.sites.removeChangeListener(this._redrawMarkers);
            app.nav.removeChangeListener(this._updateSelectionMarker);
            delete this._map;
        },

        /** This method is called when the user changes the zoom level. */
        _onZoomEnd : function() {
            var app = this._getApp();
            app.ui.actions.changeMapZoom({
                zoom : this._map.getZoom()
            });
        },

        _updateMapZoom : function() {
            var app = this._getApp();
            var zoom = app.ui.getMapZoomLevel();
            var oldZoom = this._map.getZoom();
            if (!isNaN(zoom) && zoom != oldZoom && zoom > 0 && zoom < 22) {
                this._map.setZoom(zoom);
            }
        },

        /** Returns the current bounding box of the map */
        _getCurrentBoundingBox : function() {
            var app = this._getApp();
            var boundingBox = app.ui.getMapBoundingBox();
            var min = [ boundingBox[0][1], boundingBox[0][0] ];
            var max = [ boundingBox[1][1], boundingBox[1][0] ];
            var bounds = L.latLngBounds(min, max);
            return bounds;
        },

        /**
         * Handles notifications about zoom changes requests and changes the
         * zoom level on the map.
         */
        _updateMapPosition : function() {
            var bounds = this._getCurrentBoundingBox();
            if (!this._mapInitialized) {
                this._mapInitialized = true;
                return this._fitBounds(bounds);
            } else {
                this._panInsideBounds(bounds);
            }
        },

        /**
         * This method is called when the data in the store are updated
         */
        _redrawMarkers : function() {
            var app = this._getApp();
            var data = app.sites.getSites();
            this._markers.setData(data);
            //this._fitMapToSearchResults();
        },

        _getIntersection : function(first, second) {
            function min(a, b) {
                var lat = Math.min(a.lat, b.lat);
                var lng = Math.min(a.lng, b.lng);
                return L.latLng(lat, lng);
            }
            function max(a, b) {
                var lat = Math.max(a.lat, b.lat);
                var lng = Math.max(a.lng, b.lng);
                return L.latLng(lat, lng);
            }
            var asw = first.getSouthWest();
            var bsw = second.getSouthWest();
            var ane = first.getNorthEast();
            var bne = second.getNorthEast();
            return L.latLngBounds(max(asw, bsw), min(ane, bne));
        },

        /**
         * Adjust the map view to fit with all found search results.
         */
        _fitMapToSearchResults : function() {
            var app = this._getApp();
            var data = app.sites.getSites();
            var bounds = this._buildBoundingBox(data);
            console.log('>> BOUNDS', bounds);
            if (bounds) {
                var mapBounds = this._getCurrentBoundingBox();
                var ok = false;
                if (mapBounds && mapBounds.intersects(bounds)) {
                    var b = this._getIntersection(mapBounds, bounds);
                    this._fitBounds(b);
                    ok = true;
                }
                if (!ok) {
                    this._fitBounds(bounds);
                }
            }
        },

        /**
         * Removes markers and cluster layer from the map; cleans up the index
         * of individual markers.
         */
        _removeMarkers : function(map) {
            if (this._markers) {
                map.removeLayer(this._markers);
                delete this._markers;
            }
        },

        /**
         * Initializes a cluster layer and an internal index of markers. This
         * method does not attache the cluster layer to the map.
         */
        _initMarkers : function(map) {
            var that = this;
            var app = this._getApp();
            that._markers = that._newMarkersLayer({
                fillColor : 'orange',
                lineColor : 'transparent',
                getIcon : function(type, zoom) {
                    return app.ui.getCategoryIcon(type)
                }
            });
            map.addLayer(that._markers);

            that._markers.on('click', function(e) {
                var id = app.sites.getId(e.data);
                app.nav.actions.selectSite({
                    siteId : id
                });
            });

            return;
            // FIXME: remove popup
            var popup = L.popup();
            var popupContent = document.createElement('div');
            popup.setContent(popupContent);
            var onMouseOver = function(e) {
                var resource = e.data;
                var geom = resource.geometry;
                if (!geom || !geom.coordinates)
                    return;
                var lng = geom.coordinates[0];
                var lat = geom.coordinates[1];
                var latlng = L.latLng(lat, lng);

                var resourceType = 'resource';
                var view = app.viewManager.newView('popup', resourceType, {
                    app : app,
                    data : resource
                });
                var props = resource.properties;
                popup.setLatLng(latlng);
                popupContent.innerHTML = '<p>' + props.address + '</p>';
                popup.openOn(map);
            }
            onMouseOver = _.debounce(onMouseOver, 250);
            that._markers.on('mouseover', onMouseOver);
        },

        _initSelectedMarkers : function(map) {
            var that = this;
            var app = that._getApp();
            that._selectedMarkers = that._newMarkersLayer({
                fillColor : '#1b1b1b',
                lineColor : 'black',
                k : 1.5,
                getIcon : function(type, zoom) {
                    return app.ui.getSelectedCategoryIcon(type)
                }
            });
            map.addLayer(that._selectedMarkers);

            that._selectedMarkers.on('click', function(e) {
                app.nav.actions.selectSite({
                    siteId : null
                });
            });
        },

        _newMarkersLayer : function(markerOptions) {
            var app = this._getApp();
            var mapOptions = this._getMapOptions();

            var minZoom = 9;
            var maxZoom = 12;
            var minRadius = 2;
            var maxRadius = 24;

            var radius = 16;
            var minRadius = 3;
            var maxRadius = 24;
            var k = markerOptions.k || 1;

            function getRadius(zoom) {
                var radius;
                if (zoom < minZoom)
                    radius = minRadius;
                else if (zoom > maxZoom)
                    radius = maxRadius;
                else
                    radius = minRadius + (maxRadius - minRadius)
                            * (zoom - minZoom) / (maxZoom - minZoom);
                return radius * k;

                var r = radius * Math.pow(2, (zoom - minZoom));
                r = Math.min(Math.max(minRadius, r), maxRadius);
                return r;
            }
            function getLineWidth(zoom) {
                var r = getRadius(zoom) / 5;
                return Math.min(r, 2);
            }

            var dataRenderer = new OrganizationsRenderer(_.extend({
                radius : getRadius,
                debug : true,
                lineWidth : getLineWidth,
                app : app
            }, markerOptions));
            // Data layer instantiation
            var dataLayer = new LeafletDataLayer({
                dataRenderer : dataRenderer
            });
            return dataLayer;
        },

        _buildBoundingBox : function(items) {
            var bounds = null;
            if (items) {
                _.each(items, function(item) {
                    var geom = item.geometry;
                    if (!geom)
                        return;
                    var latlng = this._getLatLng(geom.coordinates);
                    if (!bounds) {
                        bounds = L.latLngBounds([ latlng, latlng ]);
                    } else {
                        bounds = bounds.extend(latlng);
                    }
                }, this);
            }
            return bounds;
        },

        /**
         * This method is called to highlight currently active marker
         */
        _updateSelectionMarker : function() {
            var that = this;
            var app = this._getApp();
            var selectedId = app.nav.getSelectedSiteId();
            var resource = app.nav.getSelectedSite();
            var data = resource ? [ resource ] : [];
            this._selectedMarkers.setData(data);

            if (!resource) {
                // if (that._prevZoomLevel) {
                // that._map.setView(that._prevCenter, that._prevZoomLevel);
                // delete that._prevZoomLevel;
                // delete that._prevCenter;
                // } else {
                // that._fitMapToSearchResults();
                // }
                return;
            }
            var mapOptions = that._getMapOptions();
            var geom = resource.geometry;
            if (!geom || !geom.coordinates)
                return;
            var coordinates = that._getLatLng(geom.coordinates);
            var selectionZoomLevel = mapOptions.selectionZoom;
            if (selectionZoomLevel) {
                // if (!that._prevZoomLevel) {
                // that._prevZoomLevel = that._map.getZoom();
                // that._prevCenter = that._map.getCenter();
                // }
                if (that._map.getZoom() < selectionZoomLevel) {
                    that._map.once('zoomend', function() {
                        that._focusTo(coordinates);
                    });
                    that._map.setZoom(selectionZoomLevel);
                } else {
                    that._focusTo(coordinates);
                }
            } else {
                that._focusTo(coordinates);
            }
        },

        /**
         * This method is called to highlight currently active marker
         */
        _removeSelectedMarkers : function() {
            if (this._selectedMarkers) {
                map.remove(this._selectedMarkers);
                delete this._selectedMarkers;
            }
        },

        _getLatLng : function(geoJsonCoords) {
            var coords = geoJsonCoords || [ 0, 0 ];
            var result = L.latLng(coords[1], coords[0]);
            return result;
        }

    });

});
