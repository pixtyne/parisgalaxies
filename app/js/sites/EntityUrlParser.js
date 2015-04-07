if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(
// Dependencies
[ 'require', 'underscore', 'mosaic-commons', './UrlParser' ],
// Module
function(require) {
    var _ = require('underscore');
    var Mosaic = require('mosaic-commons');
    var UrlParser = require('./UrlParser');

    var SEGMENTS = [ 'sectors', 'activities', 'cityAlias', 'department', ];
    var EntityUrlParser = Mosaic.Class.extend({

        initialize : function(options) {
            this.setOptions(options);
            this._parser = new UrlParser({
                segments : SEGMENTS
            });
        },

        formatCriteria : function(criteria) {
            var entity = criteria.entity;
            var path = this._parser.format(criteria);
            path = '/' + entity + '/' + path;
            criteria = _.extend({}, criteria);
            delete criteria.entity;
            _.each(SEGMENTS, function(segment) {
                delete criteria[segment];
            });
            var query = serializeQuery(criteria);
            if (query && query != '') {
                path += '?' + query;
            }
            return path;
        },

        parseCriteria : function(uri) {
            uri = '' + (uri || '');
            var idx = uri.indexOf('?');
            var query = {}
            var entity = 'entity-fr';
            var path = '';
            uri.replace(/^\/?([^\/]+)\/(.*?)(\?.*)?$/, function(match, entityMatch, pathMatch, queryMatch) {
                entity = entityMatch;
                if (queryMatch && queryMatch != '') {
                    queryMatch = queryMatch.substring(1);
                    query = splitQuery(queryMatch);
                }
                path = pathMatch;
                return '';
            });
            var criteria = {};
            if (entity && entity !== '') {
                criteria.entity = entity;
            }
            _.extend(criteria, this._parser.parse(path + ''), query);
            var result = {};
            _.filter(criteria, function(val, key) {
                if (!!val && val != '') {
                    result[key] = val;
                }
            });
            return result;
        },

    });

    function splitQuery(query) {
        var result = {};
        if (query && query !== '') {
            var array = query.split('&');
            for ( var i = 0; i < array.length; i++) {
                var str = array[i];
                var parts = str.split('=');
                var key = decodeURIComponent(parts[0]);
                var value = decodeURIComponent(parts[1]);
                if (_.has(result, key)) {
                    var values = result[key];
                    if (!_.isArray(values)) {
                        values = result[key] = [ values ];
                    }
                    values.push(value);
                } else {
                    result[key] = value;
                }
            }
        }
        return result;
    }

    /** Serializes the specified query object as a string */
    function serializeQuery(query) {
        var result = '';
        for ( var key in query) {
            if (query.hasOwnProperty(key)) {
                var value = query[key] || '';
                var k = encodeURIComponent(key);
                var array = _.isArray(value) ? value : [ value ];
                _.each(array, function(v) {
                    if (result.length > 0) {
                        result += '&';
                    }
                    result += encodeURIComponent(k);
                    result += '=';
                    result += encodeURIComponent(v);
                });
            }
        }
        return result;
    }
    ;

    return EntityUrlParser;

});