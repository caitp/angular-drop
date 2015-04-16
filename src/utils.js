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

matchesFn,
CLASS_SELECTOR_REGEXP =
  /^(\s*(\.-?([a-z\u00A0-\u10FFFF]|(\\\d+))([0-9a-z\u00A0-\u10FFFF_-]|(\\\d+))*)\s*)+$/i,

getMatchesFn = function() {
  var selectorFunctions = ['matches', 'matchesSelector', 'msMatchesSelector', 'mozMatchesSelector',
    'webkitMatchesSelector', 'oMatchesSelector'];

  if (typeof window.Element === 'function' && typeof window.Element.prototype === 'object') {
    for (var i=0, ii=selectorFunctions.length; i < ii; ++i) {
      var name = selectorFunctions[i];
      if (typeof window.Element.prototype[name] === 'function') {
        var matches = window.Element.prototype[name];
        return function(jq, selector) {
          return matches.call(jq[0], selector);
        }
      }
    }
  }
  if (typeof $ === 'function' && typeof $.prototype.is === 'function') {
    return function(jq, selector) {
      return jq.is(selector);
    }    
  } else if (typeof Sizzle === 'function' && typeof Sizzle.matchesSelector === 'function') {
    return function(jq, selector) {
      return Sizzle.matchesSelector(jq[0], selector);
    }
  } else {
    // Default case: throw if any non-class selectors are used.
    return function(jq, selector) {
      if (selector && CLASS_SELECTOR_REGEXP.test(selector)) {
        selector = selector.replace(/\s+/g, '').replace('.', ' ').replace(/^\s+/, '').replace(/\s+$/, '');
        return jq.hasClass(selector);
      } else {
        throw new Error("Only class-based selectors are supported in this browser.");
      }
    }
  }
},

matchesSelector = function(node, selector) {
  var domEle;

  if (typeof matchesFn !== 'function') {
    matchesFn = getMatchesFn();
  }

  return matchesFn(node, selector);
};
