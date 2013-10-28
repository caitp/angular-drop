'use strict';

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
