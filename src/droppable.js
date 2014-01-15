'use strict';


/**
 * @ngdoc directive
 * @module ui.drop
 * @name ui.drop.directive:droppable
 *
 * @description
 *
 * Simple directive which denotes a 'droppable' widget (an area onto which adraggable may be dropped).
 *
 * @param {string=} drop-allowed provides an array of element selector constraints for which all draggables must contain
 * in order to be dropped within this droppable.  If no drop-allowed is provided, all draggables will be allowed.  To
 * specify multiple selectors list them separated by commas (drop-allowed="div.class-one, div#id-two").  If jQuery is
 * present $.fn.is is used otherwise Element.matches selector functions are used (vendor prefixed).  If Element.matches
 * functionality is not present class checking is used (element.hasClass).
 *
 */
var droppableDirective = ['$drop', '$parse', function($drop, $parse) {
  return {
    restrict: 'A',
    compile: function($element, $attrs) {
      return function(scope, element, attrs) {
        var allowed = $parse(attrs.dropAllowed || 'undefined')(scope);
        var droppable = $drop.droppable(element);
        if (allowed) {
          droppable.allowedSelectors(allowed);
        }
      }
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

        if (!$droppable || !this.dropAllowed($droppable, current.element)) {
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
      },

      /**
       * @ngdoc method
       * @module ui.drop
       * @name ui.drop.$drop#dropAllowed
       * @methodOf ui.drop.$drop
       *
       * @param {droppable} The ui.drop.$drop.Droppable object
       * @param {draggable} An angular.element() object representing the draggable
       * @returns {boolean} whether or not the drop is allowed based
       *
       * @description
       * Function to check if the provided draggable element has the class of the provided droppables 'allowed'
       * attribute.  Returns true if a match is found, or false otherwise.
       *
       */
      dropAllowed: function(droppable, draggable) {
        var allowed = droppable.allowedSelectors();
        if (!allowed || !angular.isArray(allowed)) {
          return true;
        }

        for (var i = 0; i < allowed.length; ++i) {
          var curAllowed = allowed[i];
          if (typeof curAllowed === 'string') {
            if (matchesSelector(draggable, curAllowed)) {
              return true;
            }
          }
        }
        return false;
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

        if (draggable.options.keepSize) {
          draggable.element.css(draggable.keepSize);
          draggable.keepSize = undefined;
        }

        draggable.element.css({
          display: options.display
        });
        draggable.hanging = false;
        if (!$rootScope.$$phase) {
          $rootScope.$apply();
        }
        draggable.finish();
      },

      /**
       * @ngdoc function
       * @module ui.drop
       * @name ui.drop.Droppable#allowedSelectors
       * @methodOf ui.drop.$drop.Droppable
       * @function
       *
       * @param {allowedSelectors} An array of strings representing selectors of draggables which can be
       * dropped within the draggable
       * @returns {Array} Array of strings
       *
       * @description
       * A Setter/Getter method for the array of allowed selectors for this droppable.
       */
      allowedSelectors: function(allowedSelectors) {
        if (arguments.length > 0) {
          if (typeof allowedSelectors === 'string') {
            allowedSelectors = allowedSelectors.split(',');
          }
          if (angular.isArray(allowedSelectors)) {
            this.allowed = allowedSelectors;
          }
          return this;
        }
        return this.allowed;
      }
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
