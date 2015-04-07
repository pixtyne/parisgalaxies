define(
// Dependencies
[ 'require', 'underscore', 'react', 'mosaic-commons', 'mosaic-core',
        './sites/Module', 'jsx!./views/MainView', './views/list/registration',
        'jsx!./views/OldBrowserNotification', './sites/BrowserUtils',
        './views/map/registration' ],
// Module
function(require) {

    var React = require('react');
    var Mosaic = require('mosaic-commons');
    var MainModule = require('./sites/Module');
    var MainView = require('jsx!./views/MainView');
    var initListViews = require('./views/list/registration');
    var initMapViews = require('./views/map/registration');
    var OldBrowserNotification = require('jsx!./views/OldBrowserNotification');
    var BrowserUtils = require('./sites/BrowserUtils');

    return Mosaic.App.extend({

        /**
         * This function loads and initializes all modules of this application.
         */
        initModules : function() {
            var ieVersion = BrowserUtils.getIeVersion();
            this._oldBrowser = ieVersion && ieVersion < 10;
            // this._oldBrowser = true;
            if (this._oldBrowser)
                return;

            this.viewManager = new Mosaic.Core.ViewManager();
            var module = new MainModule({
                app : this
            });
            this.sites = module.sites;
            this.nav = module.nav;
            this.entities = module.entities;
            this.ui = module.ui;
            this.geo = module.geo;
            initListViews(this);
            initMapViews(this);
        },

        /**
         * Pre-loads data for this application and returns a promise with
         * results.
         */
        preloadData : function() {
            if (this._oldBrowser)
                return;
            return this.sites.actions.loadData();
        },

        /**
         * This method initializes main views of this application.
         */
        initViews : function(err) {
            if (err) {
                console.log('ERROR!', err);
            }
            var containers = this.options.containers;
            var view;
            if (this._oldBrowser) {
                this.mainView = new OldBrowserNotification({
                    app : this
                });
            } else {
                this.mainView = new MainView({
                    app : this
                });
            }
            React.renderComponent(this.mainView, containers.main);
        }

    });

});