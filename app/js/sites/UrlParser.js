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

    var UrlParser = Mosaic.Class.extend({
        initialize : function(options) {
            this.setOptions(options);
        },

        _getSegmentNames : function() {
            return this.options.segments || [];
        },
        _getDelimiter : function() {
            return this.options.delimiter || '--';
        },

        parse : function(path) {
            var array = [];
            if (path) {
                var delim = this._getDelimiter();
                if (delim) {
                    var regexp = new RegExp(delim, 'gim');
                    path = path.replace(regexp, '/');
                }
                array = path.split('/');
            }
            var names = this._getSegmentNames();
            var result = {};
            var emptyVal = this._getEmptyValue();
            for (var i = 0; i < names.length; i++) {
                var name = names[i];
                var value = i < array.length ? array[i] : emptyVal;
                result[name] = value;
            }
            return result;
        },

        format : function(params) {
            var names = this._getSegmentNames();
            var values = [];
            for (var i = 0; i < names.length; i++) {
                var name = names[i];
                var val = params[name] || '';
                values.push(val);
            }
            while (values.length && values[values.length - 1] == '') {
                values.pop();
            }
            var delim = this._getDelimiter() || '/';
            var result = values.join(delim);
            return result;
        },

        _getEmptyValue : function() {
            var val = this.options.empty;
            if (val !== undefined)
                return val;
            return '';
        }

    });

    return UrlParser;

});