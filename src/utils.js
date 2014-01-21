/**
 * @ngdoc object
 * @module ui.drop
 * @name ui.drop.Version
 * @description
 * An object that contains information about the current Angular-Drop version. This object has the
 * following properties:
 *
 * - `full` – `{string}` – Full version string, such as "0.9.18".
 * - `major` – `{number}` – Major version number, such as "0".
 * - `minor` – `{number}` – Minor version number, such as "9".
 * - `dot` – `{number}` – Dot version number, such as "18".
 * - `codeName` – `{string}` – Code name of the release, such as "jiggling-armfat".
 */
var _version = {
  full: '"DROP_VERSION_FULL"',    // all of these placeholder strings will be replaced by grunt's
  major: '"DROP_VERSION_MAJOR"',    // package task
  minor: '"DROP_VERSION_MINOR"',
  dot: '"DROP_VERSION_DOT"',
  codeName: '"DROP_VERSION_CODENAME"'
},

currentDrag,

booleans = {
  'false': false,
  'true': true,
  '': true
},

unconst = function(value) {
  if (typeof value === 'string') {
    var num;
    if (booleans.hasOwnProperty(value)) {
      return booleans[value];
    } else {
      // TODO: Support floats?
      num = parseInt(value, 10);
      if (num===num) {
        value = num;
      }
    }
  }
  return value;
};

function Draggable() {};
function Droppable() {};

var
readonly = function(target, name, fn) {
  if (Object.defineProperty) {
    Object.defineProperty(target, name, {
      get: fn,
      set: function() {},
      configurable: false,
      enumerable: true
    });
  } else if (target.__defineGetter__) {
    target.__defineGetter__(name, fn);
  } else {
    target[name] = fn();
  }
},

jqIs = $ && $.prototype.is,

DOM = {
  nodeEq: function(node, name) {
    return (typeof (node.nodeName === 'string' ?
            node.nodeName.toLowerCase() : node[0].nodeName).toLowerCase() === name);
  },

  offset: function(node) {
    node = node.length ? node[0] : node;
    var win, box = { top: 0, left: 0 },
        doc = node && node.ownerDocument;

    if (!doc) {
      return;
    }

    doc = doc.documentElement;

    if (!DOM.contains(doc, node)) {
      return box;
    }

    if (angular.isFunction(node.getBoundingClientRect)) {
      box = node.getBoundingClientRect();
    }

    win = DOM.window(doc);

    return {
      top: box.top + win.pageYOffset - doc.clientTop,
      left: box.left + win.pageXOffset - doc.clientLeft
    };
  },

  contains: function(a, b) {
    var adown = a.nodeType === 9 ? a.documentElement : a,
        bup = b && b.parentNode;
    return a === bup || !!( bup && bup.nodeType === 1 && DOM.contains(adown, bup) );
  },

  window: function(node) {
    node = typeof node.nodeName === 'undefined' && typeof node.length === 'number' ?
           node[0] : node;
    return DOM.isWindow(node) ? node : (node.nodeType === 9 && node.defaultView) ||
                                (node.ownerDocument && (node.ownerDocument.defaultView ||
                                  node.ownerDocument.parentWindow));
  },

  isWindow: function(obj) {
    return obj && obj.document && obj.location && obj.alert && obj.setInterval;
  },

  swapCss: function (element, css, callback, args) {
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
  },

  swapDisplay: /^(none|table(?!-c[ea]).+)/,

  cssShow: {
    position: 'absolute',
    visibility: 'hidden',
    display: 'block'
  },

  size: function(node) {
    var jq = angular.element(node);
    node = node.nodeName ? node : node[0];
    if (node.offsetWidth === 0 && DOM.swapDisplay.test(jq.css('display'))) {
      return DOM.swapCss(node, DOM.cssShow, getHeightAndWidth, [node]);
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
    var css = DOM.size(node);
    css.width = css.width + 'px';
    css.height = css.height + 'px';
    return css;
  },
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
  }
};
