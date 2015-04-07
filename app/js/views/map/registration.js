define(
// Dependencies
[ 'require', 'underscore', 'jsx!./Popup.Default' ],
// Module
function(require, _) {
    // Views mapping for individual object types
    var map = {
        '' : require('jsx!./Popup.Default'),
    };
    return function(app) {
        _.each(map, function(View, type) {
            app.viewManager.registerView('popup', type, View);
        });
    }
});