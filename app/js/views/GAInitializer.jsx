/**
 * @jsx React.DOM
 */

//copied from https://github.com/hzdg/react-google-analytics

define(
// Dependencies
[ 'require', 'react' ],
// Module
function(require) {
    'use strict';
    var React = require('react');

    var _name, __slice = [].slice;
    var script = React.DOM.script;

    if (typeof window !== "undefined" && window !== null) {
        if (window.GoogleAnalyticsObject == null) {
            window.GoogleAnalyticsObject = 'ga';
        }
    }

    if (typeof window !== "undefined" && window !== null) {
        if (window.ga == null) {
            window.ga = ga;
        }
    }

    var ga = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return typeof window !== "undefined" && window !== null ? window[window.GoogleAnalyticsObject].apply(window, args)
                : void 0;
    };

    if (typeof window !== "undefined" && window !== null) {
        if (window[_name = window.GoogleAnalyticsObject] == null) {
            window[_name] = function() {
                var api, args;
                args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
                api = window[window.GoogleAnalyticsObject];
                (api.q || (api.q = [])).push(args);
            };
        }
    }

    var scriptIsAdded = false;
    return React.createClass({
        displayName : 'GAInitializer',
        componentDidMount : function() {
            window[window.GoogleAnalyticsObject].l = new Date().getTime();
            if (!scriptIsAdded) {
                return this.addScript();
            }
        },
        addScript : function() {
            var el, s;
            scriptIsAdded = true;
            el = document.createElement('script');
            el.type = 'text/javascript';
            el.async = true;
            el.src = '//www.google-analytics.com/analytics.js';
            s = document.getElementsByTagName('script')[0];
            return s.parentNode.insertBefore(el, s);
        },
        render : function() {
            return script(null);
        }
    });

});
