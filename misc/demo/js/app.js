angular.module("dropDemo", ["ui.drop"])

.controller("DemoCtrl", function($scope) {
  
})
.controller("DropCtrl", function($scope, $element) {
  $scope.hasElement = function() {
    return $element.children('div').length > 0;
  }
});
