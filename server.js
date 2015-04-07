var port = 3712;

var _ = require('underscore');
var Mosaic = require('mosaic-commons');
require('mosaic-teleport');
var FS = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var ServiceStubProvider = require('mosaic-teleport-server').ServiceStubProvider;
var EntityUrlParser = require('./app/js/sites/EntityUrlParser');
var PgConnector = require('./pg-utils');
var Utils = require('./content/entities/service.utils');
var StaticContentGenerator = require('./app/js/sites/StaticContentGenerator');
var Config = require('./config');
var config = new Config('./config.yml');

var staticContentGenerator = new StaticContentGenerator();

/* ------------------------------------------------------- */
// Creates and initializes an Express application
var workdir = process.cwd();
var app = express();
app.use(bodyParser.urlencoded({
    extended : false
}));
app.use(bodyParser.json());
app.use(cookieParser('optional secret string'));

var contentDir = workdir + '/app';
var indexContent;
function loadIndexPageContent() {
    var P = Mosaic.P;
    return P.then(function() {
        if (indexContent) {
            return indexContent;
        }
        return P.ninvoke(FS, 'readFile', contentDir + '/template.html', 'UTF-8')//
        .then(function(content) {
            indexContent = content;
            return indexContent;
        });
    });
}

var connector = new PgConnector({
    url : config.getDbUrl()
});

app.get('/', ServiceStubProvider.handleRequest(function(req, res) {
    res.writeHead(302, {
        'Location' : '/app/'
    });
    res.end();
}));

app.use('/app', express.static(contentDir));
app.get('/app(/[^\/]+)?', ServiceStubProvider.handleRequest(function(req, res) {
    console.log('*******************');
    var parser = new EntityUrlParser();
    var path = ServiceStubProvider.getPath(req);
    if (req.query && req.query.q) {
        path += '?q=' + req.query.q;
    }
    var criteria = parser.parseCriteria(path);

    loadIndexPageContent().then(
            function(content) {
                console.log('--------------------------------------');

                console.log('>> CRITERIA:', criteria);
                var that = this;
                return Mosaic.P.then(
                        function() {
                            var query = 'select id, properties::json as properties, '
                                    + 'st_asgeojson(geometry)::json as geometry ' + 'from objects ';

                            var where = Utils.buildWhereStatement(criteria);
                            if (where && where != '') {
                                query += ' ' + where;
                            }
                            console.log('QUERY: ', query);
                            return connector.exec({
                                query : query,
                                offset : 0,
                                limit : 1000
                            });
                        }).then(function(results) {

                    var output = staticContentGenerator.generateContent(results, criteria);
                    console.log('--------------------------------------');
                    var result = content.replace(/<\!--\s*\((.*?)\)\s*-->/gim, function(match, first) {
                        return output;
                    });

                    res.status(200);
                    res.send(result);

                });

            });
}));

app.use('/entities', express.static(contentDir));
app.get('/entities/[^\/]+', ServiceStubProvider.handleRequest(function(req, res) {
    var parser = new EntityUrlParser();
    var path = ServiceStubProvider.getPath(req);

    var criteria = parser.parseCriteria(path);

    loadIndexPageContent().then(
            function(content) {
                console.log('--------------------------------------');
                console.log('>> CRITERIA:', criteria);
                criteria.taxId = criteria.sectors;
                delete criteria.sectors;

                var that = this;
                return Mosaic.P.then(
                        function() {
                            var query = 'select id, properties::json as properties, '
                                    + 'st_asgeojson(geometry)::json as geometry ' + 'from objects ';

                            var where = Utils.buildWhereStatement(criteria);
                            if (where && where != '') {
                                query += ' ' + where;
                            }
                            console.log('QUERY: ', query);
                            return connector.exec({
                                query : query,
                                offset : 0,
                                limit : 1000
                            });
                        }).then(function(results) {
                    console.log('--------------------------------------');

                    var result = '', output = '';

                    if (results && results.features && results.features.length > 0)
                        output = staticContentGenerator.generateLocalBusinessDescription(results.features[0]);

                    result = content.replace(/<\!--\s*\((.*?)\)\s*-->/gim, function(match, first) {
                        return output;
                    });

                    res.status(200);
                    res.send(result);

                });

            });
}));

//app.use('/data', express.static(workdir + '/data'));
// Add re-direction to the base map
// app.use('/', express.static(workdir + '/app'));


app.use('/app', express.static(contentDir));

/* ------------------------------------------------------- */

var prefix = '/service';
var serviceOptions = {
    path : prefix,
    dir : workdir
};
var handlerProvider = new ServiceStubProvider(serviceOptions);

var mask = prefix + '/:service([^]*)';
app.get(mask + '.invalidate', ServiceStubProvider.handleRequest(function(req, res) {
    var path = ServiceStubProvider.getPath(req);
    return handlerProvider.removeEndpoint(path).then(function() {
        return 'OK';
    });
}));
app.all(mask, ServiceStubProvider.handleRequest(function(req, res) {
    var path = ServiceStubProvider.getPath(req);
    return handlerProvider.loadEndpoint(path).then(function(handler) {
        if (!handler) {
            throw new Error("Service handler is not defined." + //
            "Path: \'" + path + ".");
        }
        return handler.handle(req, res);
    });
}));

/* ------------------------------------------------------- */
// Start the server
app.listen(port);
console.log('http://localhost' + (port ? ':' + port : '') + '/');
