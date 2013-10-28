/**
 * @ngdoc property
 * @name $dnd.version
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

currentDrag;

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

DOM = {
  nodeEq: function(node, name) {
    return (typeof (node.nodeName === 'string' ?
            node.nodeName : node[0].nodeName).toUpperCase() === name);
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

  trigger: function(name, element, memo) {
    var event;
    if (document.createEvent) {
      event = document.createEvent("HTMLEvents");
      event.initEvent(name, true, true);
    } else {
      event = document.createEventObject();
      event.eventType = name;
    }

    event.eventName = name;
    event.memo = memo || {};

    if (document.createEvent) {
      element.dispatchEvent(event);
    } else {
      element.fireEvent("on" + event.eventType, event);
    }
  }
};
