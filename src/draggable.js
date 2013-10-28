'use strict';

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
        if (!angular.isElement(element)) {
          throw "expected element";
        }
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
        self.cssPosition = self.element.css("position");

        self.offset = self.positionAbs = DOM.offset(self.element);

        self.offset.scroll = false;

        angular.extend(self.offset, {
          click: {
            top: event.pageY - self.offset.top,
            left: event.pageX - self.offset.left
          },
        });

        self.startEvent = event;
        self.originalPosition = self.element.css('position');
        self.element.css({
          position: 'absolute'
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
          top: event.clientY,
          left: event.clientX
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
