if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(
// Dependencies
[ 'require', 'underscore', 'mosaic-commons' ],
// Module
function(require) {
    var _ = require('underscore');
    var Mosaic = require('mosaic-commons');

    var UrlUtils = Mosaic.Class.extend({
        initialize : function(options) {
            this.setOptions(options);
        },

        _getCurrentUrl : function() {
            var href = window.location.href + '';
            var url = new Mosaic.Core.URI(href);
            return url;
        },

        _getCurrentPath : function(app) {
            var baseUrl = this._getBaseUrl(app);
            var uri = this._getCurrentUrl();
            uri.reset(true);
            if (uri.path.indexOf(baseUrl.path) == 0) {
                uri.path = uri.path.substring(baseUrl.path.length);
            }
            return uri + '';
        },

        _getBaseUrl : function(app) {
            if (!this._baseUrl) {
                var url = this._getCurrentUrl();
                //var app = this.options.app;
                var basePath = new Mosaic.Core.URI(app.options.baseUrl || '');
                this._baseUrl = url.resolve(basePath);
            }
            return this._baseUrl;
        },



    });

    return UrlUtils;

});