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
    var Fs = require('fs');
    var Unidecode = require('unidecode');
    var UrlParser = require('./UrlParser');
    var SEGMENTS = [ 'sectors', 'activities', 'city', 'department' ];

    var localBusinessTemplate = Fs.readFileSync('./app/local-business-template.html', {
        encoding : 'utf8'
    });
    var sectors = JSON.parse(Fs.readFileSync('./data/activites.json', {
        encoding : 'utf8'
    }));

    var activitiesMap = _loadActivities();

    function _toPath(criteria) {
        if (criteria.taxId) {
            return '/entities/' + criteria.taxId;
        }
        var parser = new UrlParser({
            segments : SEGMENTS
        });
        var path = parser.format(criteria);
        return './' + path;
    }

    /** loads all sectors and activities names and aliases into a map */
    function _loadActivities() {

        var activitiesMap = {};
        _.each(sectors, function(sector) {
            activitiesMap[sector.alias] = {
                name : sector.name,
                alias : sector.alias
            };
            _.each(sector.activities, function(activity) {
                activitiesMap[activity.alias] = activity;
            })
        });
        return activitiesMap;
    }


    function _makeAlias(label, suffix) {
        var alias = Unidecode(label).toLowerCase();
        alias = alias.replace(' ', '-');
        // for cities
        alias = alias.replace('\'', '-');
        if (suffix)
            alias += '-' + suffix;
        return alias;
    }

    var StaticContentGenerator = Mosaic.Class.extend({
        initialize : function(options) {
            this.setOptions(options);
        },
        generateContent : function(results, criteria) {
            // if a city is present in the criteria we list all
            // stores
            // otherwise if a department is present in the
            // criteria we list all cities
            // otherwise if an activity

            var listItems = [];

            var title = '';

            if (criteria.activities) {
                title = 'Secteur ' + criteria.activities + ' > Départements ayant des commerces labellisés';
                var departments = [];
                _.each(results.features, function(feature) {
                    var departmentId = feature.properties.departmentId;
                    if (departments.indexOf(departmentId) < 0)
                        departments.push(departmentId);
                });

                _.each(departments, function(departmentId) {
                    var department = departmentsMap[departmentId];
                    criteria.department = department.alias;
                    var href = _toPath(criteria);
                    listItems.push({
                        href : href,
                        label : department.name
                    });
                });
            } else {
                title = 'Catégories';
                _.each(sectors, function(sector) {
                    criteria.sectors = sector.alias;
                    listItems.push({
                        href : _toPath(criteria),
                        label : sector.name
                    });
                });
            }

            var output = '';
            _.each(listItems, function(item) {
                var link = '<a href="' + item.href + '">' + item.label + '</a>';
                output += '<li>' + link + '</li>\n';
            })

            output = '<h1>' + title + '</h1>\n\n' + output;

            return output;
        },

        generateLocalBusinessDescription : function(localBusiness) {
            var tmpl = _.template(localBusinessTemplate);
            var output = tmpl({
                properties : localBusiness.properties,
                localBusinessType : 'Business'
            });
            return output;
        }
    });

    return StaticContentGenerator;
});
