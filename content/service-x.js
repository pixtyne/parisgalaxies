var configFile = '../tilepin.config';
var Mosaic = require('mosaic-commons');
var PgConnector = require('../pg-utils');
var Teleport = require('mosaic-teleport');
var _ = require('underscore');

var Service = Mosaic.Class.extend({

    initialize : function(conf) {
        this.setOptions(conf);
        var dbUrl = this._getDbUrl();
        this.connector = new PgConnector({
            url : dbUrl
        });
        var p = this._pathMapper = new Teleport.PathMapper();
        var handler = {
            name : 'handler'
        };
        this._iterateOverPaths(function(path) {
            p.add(path, handler);
        });
    },

    _getAllPathSegments : function() {
        return [ 'sectors', 'activities', //
        'departementName', 'city', 'departementNumero', //
        'idCommerce', 'infoCom' ];
    },

    _formatPathMask : function(segments) {
        return '/:' + segments.join('/:');
    },

    _iterateOverPaths : function(callback) {
        var segments = this._getAllPathSegments();
        while (segments.length) {
            var path = this._formatPathMask(segments);
            if (callback(path)) {
                break;
            }
            segments.pop();
        }
    },

    _formatPath : function(params) {
        var result = null;
        this._iterateOverPaths(function(path) {
            try {
                var p = _.clone(params);
                result = Teleport.PathMapper.formatPath(path, p);
            } catch (e) {
            }
            return !!result;
        });
        return result;
    },

    _parsePath : function(path) {
        var results = this._pathMapper.find(path);
        return results;
    },

    html : rest('/*path', 'get', function(options) {
        var path = options.path || '';
        path = '/' + path.replace(/--/gim, '/');

        var result = this._parsePath(path);
        var newPath = this._formatPath(result.params);
        return {
            segments : result,
            formatted : newPath
        };
    }),
    _getDbUrl : function() {
        var that = this;
        var conf = that.options;
        var cred = conf.user;
        if (conf.password) {
            cred += ':' + conf.password;
        }
        if (cred && cred !== '') {
            cred += '@';
        }
        var dbUrl = 'postgres://' + cred + conf.host + ':' + conf.port + '/'
                + conf.dbname;
        console.log(dbUrl);
        return dbUrl;
    }
});

module.exports = function(options) {
    var config = require(configFile);
    var dbconf = config.getDbCredentials('');
    return new Service(dbconf);
};

/**
 * This utility function "annotates" the specified object methods by the
 * corresponding REST paths and HTTP methods.
 */
function rest(path, http, method) {
    method.http = http;
    method.path = path;
    return method;
}
