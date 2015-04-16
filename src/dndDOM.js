'use strict';

/**
 * @ngdoc object
 * @module ui.drop
 * @name ui.drop.$dndDOM
 * @requires $document
 * @requires $window
 *
 * @description
 *
 * A set of utility methods that can be use to retrieve and manipulate DOM properties.
 *
 * (based on https://github.com/angular-ui/bootstrap/blob/master/src/position/position.js)
 *
 */
var $dndDOMFactory = ['$document', '$window', function ($document, $window) {

    function getStyle(el, cssprop) {
        if (el.currentStyle) { //IE
            return el.currentStyle[cssprop];
        } else if ($window.getComputedStyle) {
            return $window.getComputedStyle(el)[cssprop];
        }
        // finally try and get inline style
        return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
        return (getStyle(element, 'position') || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function (element) {
        var docDomEl = $document[0];
        var offsetParent = element.offsetParent || docDomEl;
        while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
            offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || docDomEl;
    };

    function contains(a, b) {
        var adown = a.nodeType === 9 ? a.documentElement : a,
            bup = b && b.parentNode;
        return a === bup || !!( bup && bup.nodeType === 1 && contains(adown, bup) );
    };

    function swapCss(element, css, callback, args) {
        var ret, prop, old = {};
        for (prop in css) {
            old[prop] = element.style[prop];
            element.style[prop] = css[prop];
        }

        ret = callback.apply(element, args || []);

        for (prop in css) {
            element.style[prop] = old[prop];
        }

        return ret;
    };

    var swapDisplay = /^(none|table(?!-c[ea]).+)/;

    var cssShow = {
        position: 'absolute',
        visibility: 'hidden',
        display: 'block'
    };

    return {
        /**
         * Provides read-only equivalent of jQuery's position function:
         * http://api.jquery.com/position/
         */
        position: function (element) {
            var elBCR = this.offset(element);
            var offsetParentBCR = { top: 0, left: 0 };
            var offsetParentEl = parentOffsetEl(element[0]);
            if (offsetParentEl != $document[0]) {
                offsetParentBCR = this.offset(angular.element(offsetParentEl));
                offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
                offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
            }

            var boundingClientRect = element[0].getBoundingClientRect();
            return {
                width: boundingClientRect.width || element.prop('offsetWidth'),
                height: boundingClientRect.height || element.prop('offsetHeight'),
                top: elBCR.top - offsetParentBCR.top,
                left: elBCR.left - offsetParentBCR.left
            };
        },

        /**
         * Provides read-only equivalent of jQuery's offset function:
         * http://api.jquery.com/offset/
         */
        offset: function (element) {

            var doc = element[0] && element[0].ownerDocument;

            if (!doc) {
                return;
            }

            doc = doc.documentElement;

            if (!contains(doc, element[0])) {
                return { top: 0, left: 0 };
            }

            var boundingClientRect = element[0].getBoundingClientRect();
            return {
                width: boundingClientRect.width || element.prop('offsetWidth'),
                height: boundingClientRect.height || element.prop('offsetHeight'),
                top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
                left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
            };
        },

        /**
         * Partial implementation of https://api.jquery.com/closest/
         * @param node
         * @param value
         * @returns {angular.element}
         */
        closest: function(node, value) {
            node = angular.element(node);
            if ($.fn && angular.isFunction($.fn.closest)) {
                return node.closest(value);
            }
            // Otherwise, assume it's a tag name...
            node = node[0];
            value = value.toLowerCase();
            do {
                if (node.nodeName.toLowerCase() === value) {
                    return angular.element(node);
                }
            } while (node = node.parentNode);
        },

        size: function(node) {
            var jq = angular.element(node);
            node = node.nodeName ? node : node[0];
            if (node.offsetWidth === 0 && swapDisplay.test(jq.css('display'))) {
                return swapCss(node, cssShow, getHeightAndWidth, [node]);
            }
            return getHeightAndWidth(node);

            function getHeightAndWidth(element) {
                return {
                    width: element.offsetWidth,
                    height: element.offsetHeight
                };
            }
        },

        keepSize: function(node) {
            var css = this.size(node);
            css.width = css.width + 'px';
            css.height = css.height + 'px';
            return css;
        }
    };
}];
