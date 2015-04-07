/** @jsx React.DOM */
define([ 'underscore', 'react' ], function(_, React) {
    var FormatUtils = {
        DIV : function() {
            var args = _.toArray(arguments);
            if (args.length < 2 || this.isEmpty(args[1]))
                return undefined;
            return React.DOM.div.apply(React.DOM.div, args);
        },
        normalizeStr : function(str, repl) {
            if (this.isEmpty(str))
                return undefined;
            repl = repl || ' ';
            return str.replace(/^[\r\n\s]+|[\r\n\s]+$/gim, '').replace(/[\r\n\s]+/gim, repl);
        },
        formatText : function(str) {
            if (!str || str === '')
                return undefined;
            str = this.normalizeStr(str);
            return !this.isEmpty(str) ? str : undefined;
        },
        formatAddr : function(props) {
            return props.location;
        },
        formatCity : function(props) {
            var arr = [ props.city ];
            arr = _.filter(arr, this.notEmpty);
            return arr.length ? props.city : undefined;   
        },
        formatTel : function(str, prefix) {
            str = this.normalizeStrTel(str);
            if (this.isEmpty(str))
                return undefined;
            return [ prefix, str ];
        },
        formatRef : function(href, options) {
            options = options || {};
            href = this.normalizeStr(href);
            if (this.isEmpty(href))
                return undefined;
            var label = this.normalizeStr(options.label) || href;
            return React.DOM.a(_.extend({}, options, {
                href : href
            }), label);
        },
        wrap : function(val, prefix, suffix) {
            if (this.isNull(val))
                return undefined;
            if (prefix) {
                prefix = React.DOM.span({
                    className : 'prefix',
                    key : 'p'
                }, prefix);
            }
            if (suffix) {
                suffix = React.DOM.span({
                    className : 'suffix',
                    key : 's'
                }, suffix);
            }
            return _.filter([ prefix, val, suffix ], this.notNull);
        },
        normalizeStrTel : function(str) {
            if (this.isEmpty(str))
                return undefined;
            str = this.normalizeStr(str, '.');
            return str;
        },

        isEmpty : function(s) {
            return !s || s.length === undefined || !s.length;
        },
        notEmpty : function(s) {
            return !this.isEmpty(s);
        },
        isNull : function(s) {
            return !!!s;
        },
        notNull : function(s) {
            return !!s;
        }
    };

    _.each(_.functions(FormatUtils), function(name) {
        FormatUtils[name] = _.bind(FormatUtils[name], FormatUtils);
    });

    return FormatUtils;

});
