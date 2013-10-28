

/**
 * @license AngularDrop v0.0.1-354959a
 * (c) 2013 Caitlin Potter & Contributors. http://caitp.github.io/angular-drop
 * License: MIT
 */
(function(window, document, undefined) {'use strict';

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
  full: '0.0.1-354959a',    // all of these placeholder strings will be replaced by grunt's
  major: '0',    // package task
  minor: '0',
  dot: '1',
  codeName: 'badger'
},

currentDrag;

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
};

var draggableDirective = ['$drag', '$document', '$timeout', function($drag, $document, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var drag = $drag.draggable(element);
    }
  };
}];

var $dragProvider = function() {
  this.$get = ['$document', '$drop', function($document, $drop) {
    var $drag = {
      isDraggable: function(element) {
        return !!$drag.draggable(element);
      },

      draggable: function(element, options) {
        element = angular.element(element);

        var $draggable = element.data("$draggable");

        if ($draggable) {
          return $draggable;
        }

        if (options === false) {
          return undefined;
        }

        options = angular.extend({
          constraints: null,
          delay: 500,
          distance: 1
        }, options || {});

        $draggable = new Draggable();

        $draggable.element = element;
        $draggable.options = options;

        element.on("mousedown", $draggable.dragStart);

        element.data("$draggable", $draggable);
        return $draggable;
      }
    };

    Draggable.prototype = {
      constructor: Draggable,

      // Begin dragging
      dragStart: function(event) {
        fixup(event);
        event.preventDefault();
        var self = $drag.draggable(this);

        if (currentDrag) {
          currentDrag.dragEnd(event);
        }

        currentDrag = self;

        self.cssDisplay = self.element.css('display');
        if (!self.hanging) {
          self.cssPosition = self.element.css("position");
        }

        self.offset = self.positionAbs = DOM.offset(self.element);

        self.offset.scroll = false;

        angular.extend(self.offset, {
          click: {
            top: event.pageY - self.offset.top,
            left: event.pageX - self.offset.left
          },
        });

        self.lastMouseY = event.pageY;
        self.lastMouseX = event.pageX;

        self.startEvent = event;

        self.element.css({
          position: 'absolute',
          left: self.offset.left,
          top: self.offset.top
        });

        $document.on("mousemove", self.drag);
        $document.on("mouseup", self.dragEnd);
      },

      // End dragging
      dragEnd: function(event) {
        event.preventDefault();
        $document.off("mousemove", self.drag);
        $document.off("mouseup", self.dragEnd);

        $drop.drop(event);
      },

      // Drag element
      drag: function(event) {
        fixup(event);
        event.preventDefault();

        var self = currentDrag;
        if (!self) {
          return;
        }

        var style = self.element.prop('style');

        var position = {
          top: event.pageY,
          left: event.pageX
        },
        x = style.left || 0, y = style.top || 0,  nx, ny;

        ny = parseInt(y, 10) + (position.top - self.lastMouseY);
        nx = parseInt(x, 10) + (position.left - self.lastMouseX);

        style.left = nx + "px";
        style.top = ny + "px";

        self.lastMouseY = position.top;
        self.lastMouseX = position.left;
      },

      finish: function() {
        this.element.css({
          position: this.cssPosition
        });
        currentDrag = undefined;
      }
    };

    // Special read-only properties
    readonly($drag, 'current', function() { return currentDrag; });
    readonly($drag, 'version', function() { return _version; });

    return $drag;
  }];

  readonly(this, 'version', function() { return _version; });

  function fixup(event) {
    if (angular.isUndefined(event)) {
      event = window.event;
    }
    if (angular.isUndefined(event.layerX)) {
      event.layerX = event.offsetX;
    }
    if (angular.isUndefined(event.layerY)) {
      event.layerY = event.offsetY;
    }
  }
};

var droppableDirective = ['$drop', function($drop) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      $drop.droppable(element);
    }
  };
}];

var $dropProvider = function() {
  this.$get = ['$document', '$rootScope', function($document, $rootScope) {
    var $drop = {
      isDroppable: function(element) {
        return !!$drag.droppable(element);
      },

      droppable: function(element, options) {
        element = angular.element(element);

        var $droppable = element.data("$droppable");

        if ($droppable) {
          return $droppable;
        }

        if (options === false) {
          return undefined;
        }

        options = angular.extend({
          constraints: null,
          delay: 500,
          distance: 1
        }, options || {});

        $droppable = new Droppable();

        $droppable.element = element;
        $droppable.options = options;

        element.data('$droppable', $droppable);

        return $droppable;
      },

      drop: function(x, y) {
        if (!currentDrag) {
          return;
        }
        if (typeof x === 'undefined') {
          x = window.event;
        }
        if (angular.isObject(x)) {
          // This might be an event object
          if (typeof x.clientX === 'number' && typeof x.clientY === 'number') {
            y = x.clientY;
            x = x.clientX;
          } else if (typeof x.left === 'number' && typeof x.top === 'number') {
            y = x.top;
            x = x.left;
          }
        }
        if (typeof x !== 'number' || typeof y !== 'number') {
          return;
        }
        var current = currentDrag, element, $droppable;

        // Element must be hidden so that elementFromPoint can find the appropriate element.
        current.element.css({
          display: 'none'
        });

        element = document.elementFromPoint(x, y);
        if (!element) {
          return badDrop();
        }
        if (element.nodeType === 3) {
          // Opera
          element = element.parentNode;
        }
        element = angular.element(element);
        $droppable = element.inheritedData('$droppable');

        if (!$droppable) {
          // Element is not droppable...
          return badDrop();
        }

        $droppable.drop(current);

        return true;

        function badDrop() {
          current.hanging = true;
          current.element.css({
            display: current.cssDisplay
          });
          currentDrag = undefined;
          $rootScope.$emit("$badDrop", current);
        }
      }
    };

    Droppable.prototype = {
      constructor: Droppable,

      drop: function(draggable, options) {
        draggable = draggable || currentDrag;
        if (typeof draggable.length === 'number' || draggable.nodeName) {
          // Looks like an element...
          draggable = angular.element(draggable).data('$draggable');
        }
        if (!draggable || draggable.constructor !== Draggable) {
          return;
        }

        options = angular.extend(options || {}, {
          display: draggable.cssDisplay
        });

        this.element.append(draggable.element);

        draggable.element.css({
          display: options.display
        });
        draggable.hanging = false;
        if (!$rootScope.$$phase) {
          $rootScope.$apply();
        }
        draggable.finish();
      },
    };

    // Special read-only properties
    readonly($drop, 'version', function() { return _version; });

    return $drop;
  }];

  readonly(this, 'version', function() { return _version; });
};

var $dndProvider = function() {
  this.$get = [function() {
    var $dnd = {
      
    };

    // Special read-only properties
    readonly($dnd, 'current', function() { return currentDrag; });
    readonly($dnd, 'version', function() { return _version; });

    return $dnd;
  }];
  readonly(this, 'version', function() { return _version; });
};

function publishExternalAPI() {
  angular.module('ui.drop', [], ['$provide', function($provide) {
    $provide.provider({
      $dnd: $dndProvider,
      $drag: $dragProvider,
      $drop: $dropProvider
    });
  }]).directive({
    draggable: draggableDirective,
    droppable: droppableDirective
  });
}


  publishExternalAPI();

})(window, document);
