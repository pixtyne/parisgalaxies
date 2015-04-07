var _ = require('underscore');
var config = require('./tilepin.config.json');
var dbConfig = config.db;
module.exports = _.extend(config, {
    getDbCredentials : function(path) {
        var array = path.split('/');
        var result;
        while (!result && array.length) {
            result = dbConfig[array.join('/')];
            array.pop();
        }
        if (!result) {
            result = dbConfig['*'];
        }
        return result;
    },
    db : function(options) {
        var dataLayer = options.dataLayer;
        var sourceKey = options.params.source;
        _.defaults(dataLayer.Datasource, dbConfig[sourceKey], dbConfig['*']);
    }
});