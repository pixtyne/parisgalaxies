require([ './require.config' ], function() {
    require([ 'require', './js/main.js' ], function(require) {
        var App = require('./js/main.js');
        var app = new App({
            baseUrl : '/',
            searchServiceUrl : '/service/content/entities',
            categoriesPath : 'data/activites.json',
 //           categoriesPath : 'data/categories.json',
            containers : {
                main : document.body
            },
            map : {
                tilesUrl : 'http://{s}.tiles.mapbox.com/v3/rbw.hcodc7p1/{z}/{x}/{y}.png',
                zoom : 9,
                selectionZoom : 12,
                maxZoom : 18,
                minZoom : 3,
                attribution : 'Mentions légales',
                attributionControl: false,
                zoomControl : {
                    position : 'topleft'
                }
            },
            site : 'http://parisgalaxies.ubimix.com'
        });
        app.start().then(function() {
            console.log('App started.')
        }, function(err) {
            console.log('Error!', err.stack);
        });
    });
});