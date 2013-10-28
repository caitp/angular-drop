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
  this.$get = ['$document', function($document) {
    var $drop = {
      isDroppable: function(element) {
        return !!$drag.droppable(element);
      },

      droppable: function(element, options) {
        if (!angular.isElement(element)) {
          throw "expected element";
        }
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

        var origDisplay = current.element.css('display');
        current.element.css({
          display: 'none'
        });

        element = document.elementFromPoint(x, y);
        if (!element) {
          return;
        }
        if (element.nodeType === 3) {
          // Opera
          element = element.parentNode;
        }
        element = angular.element(element);
        $droppable = $drop.droppable(element, false);

        if (!$droppable) {
          // Element is not droppable...
          return;
        }

        element.append(current.element);
        current.element.css({
          display: origDisplay
        });
        current.finish();

        return true;
      }
    };

    function Droppable() {};

    Droppable.prototype = {
      constructor: Droppable,

      // Begin dragging
      drop: function(element) {
      },
    };

    // Special read-only properties
    readonly($drop, 'version', function() { return _version; });

    return $drop;
  }];

  readonly(this, 'version', function() { return _version; });
};
