/** @jsx React.DOM */
define([ 'underscore', 'react' ], function(_, React) {

    var DomUtilsMixin = {
        _calculateHeight : function(parent, prev, ignoreHeight) {
            var parentHeight = this._getOuterHeight(parent);
            var top = 0;
            if (prev) {
                var position = this._getPosition(prev, parent);
                top = position.top;
                if (!ignoreHeight) {
                    top += this._getOuterHeight(prev);
                }
            }
            var height = parentHeight - top;
            height = Math.max(height, 0);
            return height;
        },
        _getPosition : function(el, parent) {
            var _x = 0;
            var _y = 0;
            while (el && el !== parent && !isNaN(el.offsetLeft)
                    && !isNaN(el.offsetTop)) {
                _x += el.offsetLeft - el.scrollLeft;
                _y += el.offsetTop - el.scrollTop;
                el = el.offsetParent;
            }
            return {
                top : _y,
                left : _x
            };
        },
        _getOuterHeight : function(el) {
            var style = this._getStyle(el);
            var height = el.offsetHeight;
            height += parseInt(style.paddingTop || 0)
                    + parseInt(style.paddingBottom || 0);
            return height;
        },
        
        _getOuterWidth : function(el) {
            var width = el.offsetWidth;
            return width;
        },
        
        _getStyle : function(el) {
            var style = el.currentStyle || window.getComputedStyle(el) || {};
            return style;
        },

        _addResizeListener : function(listener) {
            window.addEventListener('resize', listener);
        },
        _removeResizeListener : function(listener) {
            window.removeEventListener('resize', listener);
        },
    };

    return DomUtilsMixin;

});
