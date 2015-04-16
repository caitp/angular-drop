'use strict';

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
  }).factory({
    $dndDOM: $dndDOMFactory
  });
}
