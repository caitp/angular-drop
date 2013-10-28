describe('droppable directive', function() {
  var element, $drag, $drop, $dnd, $compile, $rootScope;
  beforeEach(module('ui.drop'));
  beforeEach(inject(function(_$drag_, _$drop_, _$dnd_, _$compile_, _$rootScope_) {
    $drag = _$drag_;
    $drop = _$drop_;
    $dnd = _$dnd_;
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));
  afterEach(function() {
    if (element) {
      element = undefined;
    }
  });

  it('should instantiate $droppable instance', function() {
    element = $compile('<div droppable></div>')($rootScope);
    expect($drop.droppable(element, false)).toBeDefined();
  });
});
