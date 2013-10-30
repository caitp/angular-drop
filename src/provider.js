'use strict';

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
