var _ = require('underscore');

module.exports = {

    /**
     * Returns a JSON object containing "normalized" query parameters. These
     * values are used to build a cache key.
     */
    getCriteria : function(params) {
        var result = {};
        _.each([ 'q', 'sectors', 'activities', 'cityAlias', 'department', 'taxId' ], function(p) {
            result[p] = _getCriteria(params, p);
        });
        var depts = result['department'];
        if (depts && depts.length) {
            result['department'] = _.map(depts, function(dept) {
                var idx = dept.lastIndexOf('-');
                if (idx > 0) {
                    dept = dept.substring(idx + 1);
                }
                return dept;
            });
        }
        return result;
    },

    _getProperties : function(key) {
        if (key == 'q') {
            // return [ 'name', 'legalName', 'tags', 'city', 'sectors',
            // 'activities', 'address', 'contactName']; 'sectors', 'activities',
            return [ 'label', 'description', 'sectors', 'city', 'location' ];
        } else if (key == 'department') {
            return [ 'departmentId' ];
        } else if (key == 'cci') {
            return [ 'cciAlias' ];
        } else {
            return [ key ];
        }
    },

    buildWhereStatement : function(options) {
        var that = this;
        options = options || {};
        var criteria = that.getCriteria(options);
        var where = [];
        _.each(criteria, function(values, key) {
            var array = [];
            var properties = that._getProperties(key);
            _.each(properties, function(prop) {
                _.each(values, function(val) {
                    if (val != 'toutes-les-activites' && val != '00' && val != 'cci-fr')
                        array.push(" (properties->>'" + prop + "') ilike '%" + esc(val) + "%'");

                    var values = null;
                    if (val == 'architecture') {
                        values = [ 'patrimoine', 'musee' ];
                    } else if (val == 'visual-arts') {
                        values = [ 'Arts visuels', 'Art Contemporain', 'Art', 'Exposition', 'Exhibition' ];
                    } else if (val == 'cinema') {
                        values = [ 'Film' ];
                    } else if (val == 'theater') {
                        values = [ 'Spectacle vivant', 'Danse', 'Théâtre', 'Performance' ];
                    } else if (val == 'music') {
                        values = [ 'Musique', 'Concerts', 'Fêtes', 'Parties', 'Nuit', 'Boîte de Nuit',
                                'Nightclub', 'Salle de Fête' ];
                    } else if (val == 'fooding') {
                        values = [ 'Food', 'Restaurant', 'Café' ];
                    } else if (val == 'education') {
                        values = [ 'Workshop', 'Ateliers', 'Ecole', 'School' ];
                    } else if (val == 'design') {
                        values = [ 'Innovation', 'Jeux Video' ];
                    }

                    if (values)
                        completeQuery(prop, values, array);

                })
            })
            if (array.length) {
                where.push('(' + array.join(' or ') + ')');
            }
        });
        var result = '';
        if (where.length) {
            result += ' where (' + where.join(' and ') + ') ';
        }
        return result;
    }
}

function completeQuery(prop, values, array) {

    _.each(values, function(value) {
        array.push(" (properties->>'" + prop + "') ilike '%" + esc(value) + "%'");
    });
}

function esc(str) {
    return str;
}

function split(str) {
    var result = [];
    if (Array.isArray(str))
        return str.sort();
    if (str) {
        //
        _.each(str.split(/[;,]+/gim), function(s) {
            if (s != '') {
                // s = escape(s);
                result.push(s);
            }
        });
    }
    return result;
}

function _getCriteria(params, key) {
    if (!params)
        return [];
    var values = params[key];
    values = _.isArray(values) ? values : [ values ];
    var result = [];
    _.each(values, function(val) {
        result = result.concat(split(val));
    })
    result.sort();
    return result;
}
