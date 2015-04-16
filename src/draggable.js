'use strict';

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
 * @param {boolean=} drag-keep-size The dragged item should maintain its original size while dragging
 *   if set to true. Default: false.
 * @param {string=} drag-within Provides a constraint to limit the area through which an element may
 *   be dragged. It may be a tag name, or the special value '^' or 'parent' to refer to the parent
 *   element. If jQuery is in use, it may also be a selector supported by jQuery's 
 *   {@link http://api.jquery.com/closest/ $.fn.closest}.
 */
var draggableOptions = {
  'dragKeepSize': 'keepSize',
  'dragWithin': 'dragWithin'
};
var draggableDirective = [
  '$drag', '$document', '$interpolate', '$timeout', function($drag, $document, $interpolate, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var options = {};
      angular.forEach(draggableOptions, function(name, attr) {
        if (typeof attrs[attr] !== 'undefined') {
          options[name] = unconst($interpolate(attrs[attr], false)(scope));
        }
      });
      $drag.draggable(element, options);
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
  this.$get = ['$document', '$drop', '$dndPosition', function($document, $drop) {
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
       *   instead acts as a simple query. Option values include:
       *
       *   - keepSize {boolean} The dragged item should maintain its original size while dragging
       *     if set to true. Default: false.
       *   - dragWithin {string} Provides a constraint to limit the area through which an element
       *     may be dragged. It may be a tag name, or the special value '^' or 'parent' to refer to
       *     the parent element. If jQuery is in use, it may also be a selector supported by
       *     jQuery's {@link http://api.jquery.com/closest/ $.fn.closest}.
       *
       * @description
       *
       * Queries for the Draggable state of a DOM node. If the element is not
       * Draggable, and `options !== false`, then a new Draggable object is instantiated
       * and associated with the element.
       *
       * As such, this method can be used to query for the existence of Draggable state
       * attached to a DOM node, similar to {@link ui.drop.$drag#isDraggable isDraggable()}.
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
        event = fixup(event);
        event.preventDefault();
        var self = isDraggable(this) ? this : $drag.draggable(this);

        if (currentDrag) {
          currentDrag.dragEnd(event);
        }

        currentDrag = self;

        self.cssDisplay = self.element.css('display');
        self.dimensions = DOM.size(self.element);
        if (!self.hanging) {
          self.cssPosition = self.element.css("position");

          if (self.options.keepSize) {
            self.keepSize = {
              width: self.element[0].style['width'],
              height: self.element[0].style['height']
            };
            self.element.css(DOM.keepSize(self.element));
          }
        }

        if (typeof self.options.dragWithin === 'string') {
          self.constraints = dragConstraints(self.options.dragWithin, self.element);
        }

        self.offset = self.positionAbs = DOM.offset(self.element);

        self.offset = $dndPosition.position(self.element);

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
        event = fixup(event);
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

        if (!self.constraints || withinConstraints(self.constraints, nx, ny,
            self.dimensions.width, self.dimensions.height)) {
          style.left = nx + "px";
          style.top = ny + "px";
        }

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
        this.dimensions = undefined;
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
      event = window.event || {pageX: 0, pageY: 0, preventDefault: function() {}};
    }
    if (!angular.isFunction(event.preventDefault)) {
      event.preventDefault = function() {};
    }
    return event;
  }

  function isDraggable(thing) {
    return angular.isObject(thing) && thing.constructor === Draggable;
  }

  function dragConstraints(value, element) {
    if (value.length === '') {
      return;
    }
    if (/^(\.|#)/.test(value) && $.fn && angular.isFunction($.fn.closest)) {
      // Find nearest element matching class
      return constraintsFor(element.parent().closest(value));
    }
    if (/^(\^|parent)$/.test(value)) {
      return constraintsFor(element.parent());
    }
    return constraintsFor(DOM.closest(element.parent(), value));
  }

  function constraintsFor(element) {
    if (typeof element === 'undefined' || element.length === 0) {
      return;
    }
    // Use offset + width/height for now?
    var constraints = DOM.offset(element),
        dimensions = DOM.size(element);
    constraints.right = constraints.left + dimensions.width;
    constraints.bottom = constraints.top + dimensions.height;
    return constraints;
  }

  function withinConstraints(c, x, y, w, h) {
    return x >= c.left && (x+w) <= c.right && y >= c.top && (y+h) <= c.bottom;
  }
};
