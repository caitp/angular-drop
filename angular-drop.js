

/**
 * @license AngularDrop v0.0.1-bb82d83
 * (c) 2013 Caitlin Potter & Contributors. http://caitp.github.io/angular-drop
 * License: MIT
 */
(function(window, document, undefined) {'use strict';

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
  full: '0.0.1-bb82d83',    // all of these placeholder strings will be replaced by grunt's
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

/**
 * @ngdoc directive
 * @module ui.drop
 * @name ui.drop.directive:draggable
 *
 * @description
 *
 * Simple directive which denotes a 'draggable' widget. Currently, there are no parameters,
 * and it is impossible to configure the directive's behaviour.
 *
 * TODO: Provide faculties for configuring the directive.
 */
var draggableDirective = ['$drag', '$document', '$timeout', function($drag, $document, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var drag = $drag.draggable(element);
    }
  };
}];

/**
 * @ngdoc object
 * @module ui.drop
 * @name ui.drop.$dragProvider
 *
 * @description
 *
 * TODO: enable the configuration of default Draggable options in $dragProvider.
 */
var $dragProvider = function() {
  /**
   * @ngdoc object
   * @module ui.drop
   * @name ui.drop.$drag
   * @requires $document
   * @requires $drop
   *
   * @description
   *
   * Service responsible for controlling the behaviour of draggable nodes. $drag provides
   * a mechanism to drag-enable any arbitrary element, which allows it to be used in
   * custom directives, so that custom dragging behaviour can be achieved.
   */
  this.$get = ['$document', '$drop', function($document, $drop) {
    var $drag = {
      /**
       * @ngdoc method
       * @module ui.drop
       * @name ui.drop.$drag#isDraggable
       * @methodOf ui.drop.$drag
       * @returns {boolean} The draggable status of an element (true if an element is
       *   drag-enabled, otherwise false)
       *
       * @description
       *
       * Query the drag-enabled status of an element. Drag-enabled in this context means
       * that the element has Draggable state attached to it, and does not currently
       * include other factors which might enable or disable the dragging of an element.
       */
      isDraggable: function(element) {
        return !!$drag.draggable(element, false);
      },


      /**
       * @ngdoc method
       * @module ui.drop
       * @name ui.drop.$drag#draggable
       * @methodOf ui.drop.$drag
       * @returns {ui.drop.$drag.Draggable} The Draggable state bound to the element.
       *
       * @param {element} element jQuery / jqLite element or DOM node to be checked for
       *   Draggable state, or to be the element to which a new Draggable state is associated.
       * @param {object|boolean} options Configuration options for the Draggable state to be
       *   created. If set to false, no Draggable state will be created, and the function
       *   instead acts as a simple query.
       *
       * @description
       *
       * Queries for the Draggable state of a DOM node. If the element is not
       * Draggable, and `options !== false`, then a new Draggable object is instantiated
       * and associated with the element.
       *
       * As such, this method can be used to query for the existence of Draggable state
       * attached to a DOM node, similar to {@link ui.drop.$drag#isDraggable isDraggable()}.
       *
       * TODO: Control actual behaviour of Draggable state with passed in options.
       */
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


    /**
     * @ngdoc object
     * @module ui.drop
     * @name ui.drop.$drag.Draggable
     *
     * @description
     * Draggable state is an object containing the drag state of a particular DOM node.
     * It is instantiated and attached via {@link ui.drop.$drag#draggable draggable()}.
     *
     * The Draggable object is attached to a DOM node via jqLite / jQuery's expandostore,
     * using the key `$draggable`. However, it is recomended that querying for a node's
     * Draggable state be done using {@link ui.drop.$drag#draggable draggable()} or
     * {@link ui.drop.$drag#isDraggable isDraggable()}, in case the expandostore key is
     * changed in the future.
     *
     * This object provides several helpers which may be used in custom draggable node
     * directives in order to customize the behaviour of drag & drop.
     */
    Draggable.prototype = {
      constructor: Draggable,

      /**
       * @ngdoc function
       * @module ui.drop
       * @name ui.drop.$drag.Draggable#dragStart
       * @methodOf ui.drop.$drag.Draggable
       * @function
       *
       * @param {MouseEvent} event The event to which dragStart is responding
       *
       * @description
       * dragStart is meant to be called in response to a mouse event such as mousedown.
       * This routine is bound to the element's mousedown event during the construction of
       * the Draggable state.
       *
       * If it is desirable to simulate an event, the only properties which are actually
       * used in the event are Event.pageX and Event.pageY, which respectfully represent the
       * position relative to the left edge of the document, and the position relative to the
       * top edge of the document.
       *
       * See {@link https://developer.mozilla.org/en-US/docs/Web/API/event.pageX event.pageX}
       * and {@link https://developer.mozilla.org/en-US/docs/Web/API/event.pageY event.pageY}
       * for more details.
       */
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

      /**
       * @ngdoc function
       * @module ui.drop
       * @name ui.drop.$drag.Draggable#dragEnd
       * @methodOf ui.drop.$drag.Draggable
       * @function
       *
       * @param {MouseEvent} event The event to which dragEnd is responding
       *
       * @description
       * dragEnd is used to terminate a mouse drag. This is typically called in response to
       * a {@link https://developer.mozilla.org/en-US/docs/Web/Reference/Events/mouseup mouseup}
       * event on the document.
       *
       * This method essentially delegates functionality to the {@link ui.drop.$drag $drag} provider
       * in order to find the appropriate droppable element (if any) to drop over, and attempt to
       * place the element.
       *
       * Like {@link ui.drop.$drag.Draggable#dragStart dragStart()}, there are several properties
       * which are expected to be present in the event object.
       * {@link ui.drop.$drop#drop $drop.drop()} makes use of
       * {@link https://developer.mozilla.org/en-US/docs/Web/API/event.clientX event.clientX} and
       * {@link https://developer.mozilla.org/en-US/docs/Web/API/event.clientY event.clientY} if
       * they are available, which they should be in a mouse event.
       */
      dragEnd: function(event) {
        event.preventDefault();
        $document.off("mousemove", self.drag);
        $document.off("mouseup", self.dragEnd);

        $drop.drop(event);
      },

      /**
       * @ngdoc function
       * @module ui.drop
       * @name ui.drop.$drag.Draggable#drag
       * @methodOf ui.drop.$drag.Draggable
       * @function
       *
       * @param {MouseEvent} event The event to which dragEnd is responding
       *
       * @description
       * drag is used to continue a mouse drag, and is typically called in response to a mousemove
       * event.
       *
       * Like {@link ui.drop.$drag.Draggable#dragStart dragStart()}, there are several properties
       * which are expected to be present in the event object.
       * {@link https://developer.mozilla.org/en-US/docs/Web/API/event.pageX event.pageX} and
       * {@link https://developer.mozilla.org/en-US/docs/Web/API/event.pageY event.pageY} are used
       * to determine the relative position from the last mouse position, and must be present in
       * the event.
       *
       * This method functions simply by adding the difference in mouse coordinates between the
       * last cached position with the current absolute position of the element, and sets the new
       * position as an absolute position to the element's style.
       */
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

      /**
       * @ngdoc function
       * @module ui.drop
       * @name ui.drop.$drag.Draggable#finish
       * @methodOf ui.drop.$drag.Draggable
       * @function
       *
       * @description
       * The finish method is a simple helper, called by
       * {@link ui.drop.$drop.Droppable#drop Droppable.drop()} in order to terminate the dragging
       * interaction.
       *
       * This method simply restores the original css `position` property to its original pre-drag
       * value, and clears the currentDrag value.
       *
       * This should be considered a private method for the time being, because it is likely to
       * be removed from {@link ui.drop.$drag.Draggable Draggable} in the near future.
       */
      finish: function() {
        this.element.css({
          position: this.cssPosition
        });
        currentDrag = undefined;
      }
    };

    /**
     * @ngdoc property
     * @module ui.drop
     * @name ui.drop.$drag#current
     * @propertyOf ui.drop.$drag
     * @returns {ui.drop.$drag.Draggable} Draggable instance representing the currently dragged
     *   element.
     *
     * @description
     * The current {@link ui.drop.$drag.Draggable Draggable}, which is being dragged at the given
     * moment, or undefined.
     */
    readonly($drag, 'current', function() { return currentDrag; });

    /**
     * @ngdoc property
     * @module ui.drop
     * @name ui.drop.$drag#version
     * @propertyOf ui.drop.$drag
     * @returns {ui.drop.Version} Version
     *
     * @description
     * A reference to the global {@link ui.drop.Version} object.
     */
    readonly($drag, 'version', function() { return _version; });

    return $drag;
  }];

  /**
   * @ngdoc property
   * @module ui.drop
   * @name ui.drop.$dragProvider#version
   * @propertyOf ui.drop.$dragProvider
   * @returns {ui.drop.Version} Version
   *
   * @description
   * A reference to the global {@link ui.drop.Version} object.
   */
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

/**
 * @ngdoc directive
 * @module ui.drop
 * @name ui.drop.directive:droppable
 *
 * @description
 *
 * Simple directive which denotes a 'draggable' widget. Currently, there are no parameters,
 * and it is impossible to configure the directive's behaviour.
 *
 * TODO: Provide faculties for configuring the directive.
 */
var droppableDirective = ['$drop', function($drop) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      $drop.droppable(element);
    }
  };
}];

/**
 * @ngdoc object
 * @module ui.drop
 * @name ui.drop.$dropProvider
 *
 * @description
 *
 * TODO: enable the configuration of default Draggable options in $dragProvider.
 */
var $dropProvider = function() {
  /**
   * @ngdoc object
   * @module ui.drop
   * @name ui.drop.$drop
   * @requires $document
   * @requires $rootScope
   *
   * @description
   *
   * Service responsible for controlling the behaviour of droppable nodes. $drop provides
   * a mechanism to drop-enable any arbitrary element, which allows it to be used in
   * custom directives, so that custom dragging behaviour can be achieved.
   */
  this.$get = ['$document', '$rootScope', function($document, $rootScope) {
    var $drop = {
      /**
       * @ngdoc method
       * @module ui.drop
       * @name ui.drop.$drop#isDroppable
       * @methodOf ui.drop.$drop
       * @returns {boolean} The draggable status of an element (true if an element is
       *   drag-enabled, otherwise false)
       *
       * @description
       *
       * Query the droppable status of an element. Droppable in this context means
       * that the element has Droppable state attached to it, and does not currently
       * include other factors which might enable or disable the dropping a node into an
       * element.
       */
      isDroppable: function(element) {
        return !!$drag.droppable(element, false);
      },

      /**
       * @ngdoc method
       * @module ui.drop
       * @name ui.drop.$drop#droppable
       * @methodOf ui.drop.$drop
       * @returns {Object} The Droppable state bound to the element.
       *
       * @param {element} element jQuery / jqLite element or DOM node to be checked for
       *   Droppable state, or to be the element to which a new Droppable state is associated.
       * @param {object|boolean} options Configuration options for the Droppable state to be
       *   created. If set to false, no Droppable state will be created, and the function
       *   instead acts as a simple query.
       *
       * @description
       *
       * Queries for the Droppable state of a DOM node. If the element is not
       * Droppable, and `options !== false`, then a new Droppable object is instantiated
       * and associated with the element.
       *
       * As such, this method can be used to query for the existence of Droppable state
       * attached to a DOM node, similar to {@link ui.drop.$drop#isDroppable isDroppable()}.
       *
       * TODO: Control actual behaviour of Droppable state with passed in options.
       */
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

      /**
       * @ngdoc method
       * @module ui.drop
       * @name ui.drop.$drop#drop
       * @methodOf ui.drop.$drop
       *
       * @param {Event|number} event Either a DOM Event object which contains client coordinates
       *   of a mouse release, or else the x coordinate at which the mouse was released.
       * @param {number=} y The second parameter may serve as the y coordinate at which the mouse
       *   was released, and is expected to be if `event` is a number.
       *
       * @description
       * Given a client position at which a mouse was released, or a mouse release is being
       * simulated, this method attempts to find the nearest Droppable element, onto which the
       * dragged element shall be dropped.
       *
       * The css display of the dragged element is set to 'none' so that
       * {@link https://developer.mozilla.org/en-US/docs/Web/API/document.elementFromPoint
       * document.elementFromPoint()} will not always return the dragged element.
       *
       * If implementing custom drag/drop functionality, it is important to ensure that the
       * non-hidden css display be restored when finished.
       */
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

    /**
     * @ngdoc function
     * @module ui.drop
     * @name ui.drop.$drop.Droppable
     *
     * @returns {Object} Newly created Droppable instance.
     *
     * @description
     * Droppable state is an object containing the droppable state of a particular DOM node.
     * It is instantiated and attached via {@link ui.drop.$drop#droppable droppable()}.
     *
     * The Droppable object is attached to a DOM node via jqLite / jQuery's expandostore,
     * using the key `$droppable`. However, it is recomended that querying for a node's
     * Droppable state be done using {@link ui.drop.$drop#droppable droppable()} or
     * {@link ui.drop.$drop#isDroppable isDroppable()}, in case the expandostore key is
     * changed in the future.
     *
     * This object provides helpers, including a mechanism to programmatically drop an
     * arbitrary Draggable onto the current Droppable. This mechanic is used by
     * {@link ui.drop.$drop#drop $drop.drop()} in order to complete the work.
     */
    Droppable.prototype = {
      constructor: Droppable,

      /**
       * @ngdoc function
       * @module ui.drop
       * @name ui.drop.Droppable#drop
       * @methodOf ui.drop.$drop.Droppable
       * @function
       *
       * @param {Draggable=} draggable The Draggable state of the dragged element, or
       *   the current dragging object by default.
       * @param {options=} options Presently this parameter is essentially unused. It is
       *   intended to enable some customized behaviour in the future.
       *
       * @description
       * Simplifies the process of dropping a dragged element over a $droppable element,
       * and appending it to the $droppable node's children.
       */
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

    /**
     * @ngdoc property
     * @module ui.drop
     * @name ui.drop.$drop#version
     * @propertyOf ui.drop.$drop
     * @returns {ui.drop.Version} Version
     *
     * @description
     * A reference to the global {@link ui.drop.Version} object.
     */
    readonly($drop, 'version', function() { return _version; });

    return $drop;
  }];

  /**
   * @ngdoc property
   * @module ui.drop
   * @name ui.drop.$dropProvider#version
   * @propertyOf ui.drop.$dropProvider
   * @returns {ui.drop.Version} Version
   *
   * @description
   * A reference to the global {@link ui.drop.Version} object.
   */
  readonly(this, 'version', function() { return _version; });
};

/**
 * @ngdoc object
 * @module ui.drop
 * @name ui.drop.$dndProvider
 *
 * @description
 * A configuration provider which is intended to combine access to both
 * $drag and $drop during configuration, so that only a single provider
 * need be injected.
 */
var $dndProvider = function() {
  /**
   * @ngdoc object
   * @module ui.drop
   * @name ui.drop.$dnd
   *
   * @description
   *
   * TODO: Enable access to $drag and $drop in $dnd.
   */
  this.$get = [function() {
    var $dnd = {
      
    };

    /**
     * @ngdoc property
     * @module ui.drop
     * @name ui.drop.$dnd#current
     * @propertyOf ui.drop.$dnd
     * @returns {ui.drop.$drag.Draggable} Draggable instance representing the currently dragged
     *   element.
     *
     * @description
     * The current {@link ui.drop.$drag.Draggable Draggable}, which is being dragged at the given
     * moment, or undefined.
     */
    readonly($dnd, 'current', function() { return currentDrag; });

    /**
     * @ngdoc property
     * @module ui.drop
     * @name ui.drop.$dnd#version
     * @propertyOf ui.drop.$dnd
     * @returns {ui.drop.Version} Version
     *
     * @description
     * A reference to the global {@link ui.drop.Version} object.
     */
    readonly($dnd, 'version', function() { return _version; });

    return $dnd;
  }];

  /**
   * @ngdoc property
   * @module ui.drop
   * @name ui.drop.$dndProvider#version
   * @propertyOf ui.drop.$dndProvider
   * @returns {ui.drop.Version} Version
   *
   * @description
   * A reference to the global {@link ui.drop.Version} object.
   */
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
