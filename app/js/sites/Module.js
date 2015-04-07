define(
// Dependencies
[ 'require', 'underscore', 'page', 'mosaic-commons', 'mosaic-core',// 
'./EntityUrlParser', './Sites.Store', './Navigation.Store', './UI.Store',
        './Entity.Store', './BrowserUtils', './UrlUtils' ],
// Module
function(require) {

    var _ = require('underscore');
    var Page = require('page');
    var Mosaic = require('mosaic-commons');
    var SitesStore = require('./Sites.Store');
    var NavigationStore = require('./Navigation.Store');
    var UIStore = require('./UI.Store');
    var EntityUrlParser = require('./EntityUrlParser');
    var UrlUtils = require('./UrlUtils');
    var EntityStore = require('./Entity.Store');
    var BrowserUtils = require('./BrowserUtils');

    /** An API allowing to load geographic zones from the server. */
    return Mosaic.App.Api.extend({

        /**
         * This constructor registers intent handlers resolving external calls
         */
        initialize : function() {
            var that = this;
            that._urlUtils = new UrlUtils(that.options);
            that._parser = new EntityUrlParser();
            Mosaic.App.Api.prototype.initialize.apply(that, arguments);
            that.sites = new SitesStore(that.options);
            that.nav = new NavigationStore(that.options);
            that.entities = new EntityStore(that.options);
            var options = _.extend({}, that.options, {
                sites : that.sites,
                isMobile : BrowserUtils.isMobile()
            });
            that.ui = new UIStore(options);
            that.app.intents.addIntentHandlers('sites', that
                    ._getIntentsHandlers());
        },

        /**
         * Returns a map with intent names and the corresponding handlers.
         */
        _getIntentsHandlers : function() {
            var that = this;
            return {

                /**
                 * Loads all sites from the server and sets them in the store.
                 */
                'loadData' : function(intent) {
                    intent.resolve(Mosaic.P.then(function() {
                        var initApi = that._loadApiDescriptor();
                        return initApi.then(function() {
                            var promises = [];
                            promises.push(that._loadActivities()//
                            .then(function() {
                                return that._loadActivitiesIcons();
                            }));
                            //promises.push(that._loadEntities());
                            return Mosaic.P.all(promises);
                        }).then(function() {
                            return that.entities.actions.focusToEntity({
                                alias : 'entity-fr'
                            });
                        }).then(function() {
                            return that._initNavigation();
                        });
                    }));
                    intent.then(function() {
                        that.sites.notify();
                    });
                },

                'setMobileMode' : function(intent) {
                    intent.resolve(Mosaic.P.then(function() {
                        var mobileMode = !!intent.params.mobileMode;
                        that.ui._setMobileMode(mobileMode);
                    })).then(function() {
                        that.ui.notify();
                    });
                },

                'updateSearchCriteria' : function(intent) {
                    var makeSearch;
                    intent.resolve(Mosaic.P.then(function() {
                        var criteria = intent.params || {};
                        makeSearch = that.nav._hasNewSearchCriteria(criteria);
                        return that.nav._setSearchCriteria(criteria);
                    }))//
                    .then(function() {
                        that.nav.notify();
                        if (!makeSearch && !intent.force) {
                            return;
                        }
                        return that.nav.actions.search();
                    });

                },

                /** Searches sites and updates the list of sites in the store. */
                'search' : function(intent) {
                    intent.resolve(Mosaic.P.then(function() {
                        var params = that.nav.prepareSearchCriteriaForServer();
                        return that._search(params);
                    })).then(function(results) {
                        var selectedId = that.nav.getSelectedSiteId();
                        that.nav._selectSiteById(null);
                        that.sites._setSites(results);
                        that.sites.notify();
                        that.nav.notify();
                        return that.nav.actions.selectSite({
                            siteId : selectedId
                        });
                    });
                },

                /** Select/deselect a site with the specified identifier. */
                'toggleSiteSelection' : function(intent) {
                    intent.resolve(Mosaic.P.then(function() {
                        that.nav._toggleSiteById(intent.params.siteId);
                    })).then(function() {
                        that.nav.notify();
                    });
                },

                /**
                 * Selects a site by an identifier and sets it in the store.
                 * Notifies about the selected site.
                 */
                'selectSite' : function(intent) {
                    intent.resolve(Mosaic.P.then(function() {
                        var id = intent.params.siteId;
                        var site = that.sites.getSiteById(id)
                        id = site ? id : null;
                        that.nav._selectSiteById(id);
                    })).then(function() {
                        that.nav.notify();
                    });
                },

                /** Notifies about changes of the zoom levels on the map. */
                'changeMapZoom' : function(intent) {
                    intent.resolve(Mosaic.P.then(function() {
                        var zoom = intent.params.zoom;
                        if (!zoom) {
                            var delta = intent.params.zoomDelta;
                            zoom = that.ui.getMapZoomLevel() + delta;
                        }
                        return that.ui._setMapZoomLevel(zoom);
                    })).then(function() {
                        // Check that there is no performance issues
                        that.ui._notifyMapZoom();
                    });
                },

                'focusToEntity' : function(intent) {
                    var updated = false;
                    intent.resolve(Mosaic.P.then(function() {
                        var alias = intent.params.alias;
                        var boundingBox = that.entities.getBoundingBox(alias);
                        if (boundingBox) {
                            updated = true;
                            that.nav._selectSiteById(null);
                            that.ui._setMapBoundingBox(boundingBox);
                        }
                    })).then(function() {
                        if (updated) {
                            that.nav.notify();
                            that.ui._notifyMapChanges();
                        }
                    });
                }
            };
        },

        /** Loads API descriptor from the server. */
        _loadApiDescriptor : function(options) {
            var that = this;
            return Mosaic.P.then(function() {
                var serviceUrl = that.app.options.searchServiceUrl;
                var ApiDescriptor = Mosaic.Teleport.ApiDescriptor;
                return ApiDescriptor.HttpClientStub.load(serviceUrl). //
                then(function(api) {
                    that._serverApi = api;
                });
            });
        },

        /** Returns categories. */
        _loadActivities : function() {
            var that = this;
            return that._serverApi.loadActivities().then(function(result) {
                return that.nav._setCategories(result);
            });
        },

        /**
         * Loads and returns a set of icons used to represent categories of
         * various types.
         */
        _loadActivitiesIcons : function() {
            var that = this;
            return Mosaic.P.then(function() {
                var categories = that.nav.getCategories();
                var icons = {};
                var activeIcons = {};
                _.each(categories, function(cat) {
                    var key = that.nav.getCategoryKey(cat);
                    if (!key)
                        return;
                    if (cat.iconUrl) {
                        icons[key] = cat.iconUrl;
                    }
                    if (cat.activeIconUrl) {
                        activeIcons[key] = cat.activeIconUrl;
                    }
                });
                return Mosaic.P.all(
                        [ that._loadImages(icons),
                                that._loadImages(activeIcons) ])//
                .then(function(array) {
                    that.ui._setCategoryIcons(array[0], array[1]);
                });
            });
        },

        /**
         * This method loads all images using URLs specified in the given map
         * and returns a dictionary containing image keys and the corresponding
         * loaded images.
         * 
         * @param imageUrls
         *            a dictionary containing keys and the corresponding image
         *            URLs.
         */
        _loadImages : function(imageUrls) {
            var results = {};
            return Mosaic.P.all([ _.map(imageUrls, function(imageUrl, key) {
                var deferred = Mosaic.P.defer();
                var img = new Image();
                img.src = imageUrl;
                results[key] = img;
                img.onload = function(res) {
                    deferred.resolve();
                };
                img.onerror = function(err) {
                    results[key] = null;
                    deferred.resolve();
                }
                return deferred.promise;
            }) ]).then(function() {
                return results;
            });
        },

        /** Performs search using the specified search criteria. */
        _search : function(params) {
            var options = _.extend({}, params, {
                limit : 10000
            });
            return this._serverApi.search(options).then(function(results) {
                if (results && _.isArray(results.features))
                    return results.features;
                return results;
            });
        },

        /** Initializes navigation */
        _initNavigation : function() {
            var that = this;
            that._syncUrlWithCriteria = //
            _.bind(that._syncUrlWithCriteria, that);
            //FIXME
            var baseUrl = this._urlUtils._getBaseUrl(that.options.app);
            Page.base(baseUrl.path);
            Page('*', that._syncUrlWithCriteria);
            that.nav.addChangeListener(that._syncCriteriaWithUrl, that);
            Page.start();
            this._syncUrlWithCriteria();
        },

        /** Redirects to the page corresponding to the specified search criteria. */
        _syncUrlWithCriteria : function() {
            if (this._disableSearchUpdate)
                return;
            var path = this._urlUtils._getCurrentPath();
            var criteria = this._parser.parseCriteria(path);
            if (this.nav._hasNewSearchCriteria(criteria)) {
                this.nav.actions.updateSearchCriteria(criteria);
            }
        },

        /** Syncrhonizes search criteria with URL. */
        _syncCriteriaWithUrl : function() {
            var criteria = this.nav.getSearchCriteria();
            var path = this._parser.formatCriteria(criteria);
            //FIXME
            var currentPath = this._urlUtils._getCurrentPath(this.options.app);
            if (path !== currentPath) {
                this._disableSearchUpdate = true;
                setTimeout(function() {
                    Page(path);
                    this._disableSearchUpdate = false;
                }, 10);
            }
        },
    });

});