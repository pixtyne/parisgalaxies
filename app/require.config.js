require.config({
    config : {
        // For cross-domain calls the server should return results
        // with the 'Access-Control-Allow-Origin=*' HTTP header field.
        // See also:
        // * http://rockycode.com/blog/cross-domain-requirejs-text/
        text : {
            useXhr : function(url, protocol, hostname, port) {
                // allow cross-domain requests
                // remote server allows CORS
                return true;
            }
        }
    },
    packages : [ {
        name : 'when',
        location : 'libs/when',
        main : 'when'
    }, {
        name : 'superagent',
        location : 'libs/superagent',
        main : 'superagent'
    }, {
        name : 'mosaic-core',
        location : 'libs/mosaic-core/src',
        main : 'index'
    } ],
    paths : {
        'JSXTransformer' : 'libs/react/JSXTransformer',
        'jsx' : 'libs/jsx-requirejs-plugin/js/jsx',
        'react' : 'libs/react/react-with-addons',
        'leaflet' : 'libs/leaflet/dist/leaflet-src',
        'leaflet.datalayer' : 'libs/leaflet.datalayer/LeafletDataLayer',
        'lunr' : 'libs/lunr.js/lunr', 
        'mosaic-commons' : 'libs/mosaic-commons/dist/mosaic-commons',
        'mosaic-teleport' : 'libs/mosaic-teleport/dist/mosaic-teleport',
        'page' : 'libs/page/index',
        'text' : 'libs/requirejs-text/text',
        'underscore' : 'libs/underscore/underscore-min',
        'rbush' : 'libs/rbush/rbush' 
    },
    jsx : {
        fileExtension : '.jsx'
    },
    shim : {
        'underscore' : {
            exports : '_'
        },
        'leaflet.markercluster' : {
            deps : [ 'leaflet' ]
        },
        'page' : {
            exports : 'page'
        },
    }
});
