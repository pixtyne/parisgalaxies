var configFile = '../../tilepin.config';
var Mosaic = require('mosaic-commons');
var PgConnector = require('../../pg-utils');
var Utils = require('./service.utils');
var _ = require('underscore');

var Service = Mosaic.Class.extend({

    initialize : function(conf) {
        this.setOptions(conf);
        var dbUrl = this._getDbUrl();
        this.connector = new PgConnector({
            url : dbUrl
        });
    },

    /** Loads the hierarchy of sectors/activities */
    loadActivities : rest('/activities', 'get', function(options) {
        var that = this;
        return that.connector._exec({
            query : 'select properties::json from activities'
        }, function(results) {
            return _.map(results.rows, function(row) {
                return row.properties;
            });
        });
    }),

    /** Loads a list of all CCIs with their respective bounding boxes. */
    loadEntities : rest('loadEntities', 'get', function(options) {
        var that = this;
        var query = "select c.id, g.alias, "
                + "c.properties as properties, properties->>'name' as name, "
                + "st_asgeojson(g.bbox)::json as geometry from ccis as c, ( "
                + "   select o.properties->>'cciAlias' as alias, "
                + "   st_extent(o.geometry) as bbox from objects as o "
                + "group by o.properties->>'cciAlias'" // 
                + ") as g " + "where c.properties->>'alias' = g.alias "
                + "order by name";
        return that.connector._exec({
            query : query,
        }, function(results) {
            return _.map(results.rows, function(row) {
                return row;
            });
        });
    }),

    /**
     * The main service method - it performs search operations in the list of
     * commerces.
     */
    search : rest('/search', 'get', function(options) {
        var that = this;
        console.log('>> OPTIONS', options);
        return Mosaic.P.then(function() {
            var query = 'select id, properties::json as properties, '
                    + 'st_asgeojson(geometry)::json as geometry '
                    + 'from objects ';
            var where = Utils.buildWhereStatement(options);
            if (where && where != '') {
                query += ' ' + where;
            }
            console.log('QUERY: ', query);
            query += " order by properties->>'name'";
            return that.connector.exec({
                query : query,
                offset : +options.offset || 0,
                limit : +options.limit || 100
            });
        });
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
    var dbconf = config.getDbCredentials('layers/entities');
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
