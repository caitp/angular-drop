'use strict';

var $dndProvider = function() {
  this.$get = ['$drag', '$drop', function($drag, $drop) {
    var currentDrag;
    var $dnd = {
      
    };

    // Special read-only properties
    readonly($dnd, 'current', function() { return $drag.current; });
    readonly($dnd, 'version', function() { return _version; });

    return $dnd;
  }];
  readonly(this, 'version', function() { return _version; });
};
