'use strict';

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
