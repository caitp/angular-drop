describe('$drop', function() {
  var element, $drag, $drop, $dnd, $compile, $rootScope;
  beforeEach(module('ui.drop'));
  beforeEach(inject(function(_$drag_, _$drop_, _$dnd_, _$compile_, _$rootScope_) {
    $drag = _$drag_;
    $drop = _$drop_;
    $dnd = _$dnd_;
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    element = angular.element('<div id="draggable"></div>');
  }));
  afterEach(function() {
    if (element) {
      element = undefined;
    }
  });

  describe('droppable()', function() {
    it('should instantiate Droppable', function() {
      var instance = $drop.droppable(element);
      expect(instance.constructor.toString()).toContain("Droppable");
    });

    it('should return the already instantiated Droppable instance on subsequent calls', function() {
      var instance = $drop.droppable(element);
      expect($drop.droppable(element)).toEqual(instance);
    });

    it('should not instantiate Droppable if second parameter === false', function() {
      expect($drop.droppable(element, false)).toBeUndefined();
    });
  });

  describe('Droppable#drop()', function() {
    it('should append dragged element', function() {
      var d0 = $compile('<div><div><div></div></div></div>')($rootScope),
          d1 = d0.children('div').eq(0),
          d2 = d1.children('div').eq(0),
          droppable = $drop.droppable(d1);
      $drag.draggable(element);
      droppable.drop(element);

      expect(d1.children().length).toEqual(2);
      expect(d1.children().eq(1).prop('id')).toEqual('draggable');
    });
  });

  describe('dropAllowed()', function() {
    it ('should return true if the provided draggable contains the class of provided droppable allowed attribute',
        function() {
      var draggable = angular.element('<div class="allow-me"></div>'),
          droppable = $drop.droppable(angular.element('<div ></div>'));
      droppable.allowedThings(['allow-you', 'allow-me', 'allow-another']);
      expect($drop.dropAllowed(droppable, draggable)).toBeTruthy();
    });

    it ('should return false if the provided draggable does not contains the class of provided droppable allowed ' +
        'attribute', function() {
      var draggable = angular.element('<div class="allow-me"></div>')
          droppable = $drop.droppable(angular.element('<div></div>'));
      droppable.allowedThings(['disallow-me']);
      expect($drop.dropAllowed(droppable, draggable)).toBeFalsy();
    });

    it ('should return true if the provided droppable does not have an allowed attribute ', function() {
      var draggable = angular.element('<div class="allow-all"></div>'),
          droppable = $drop.droppable(angular.element('<div></div>'));
      expect($drop.dropAllowed(droppable, draggable)).toBeTruthy();
    });
  });
});
