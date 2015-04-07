define(
// Dependencies
[ 'require', 'underscore', 'jsx!./ListItem.Default' ],
// Module
function(require, _) {
    // Views mapping for individual object types
    var map = {
        '' : require('jsx!./ListItem.Default'),
    };
    return function(app) {
        _.each(map, function(View, type) {
            app.viewManager.registerView('list', type, View);
        });
    }
});