describe('draggable directive', function() {
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

  it('should instantiate $draggable instance', function() {
    element = $compile('<div draggable></div>')($rootScope);
    expect($drag.draggable(element, false)).toBeDefined();
  });

  angular.forEach({
    '': true, 'true': true, 'false': false, '0': false, '1': true
  }, function(expected, value) {
      it('should set the `keepSize` option to '+expected+' with attribute="'+value+'"', function() {
        element = $compile('<div draggable drag-keep-size="'+value+'"></div>')($rootScope);
        expect(!!$drag.draggable(element, false).options.keepSize).toEqual(expected);
      });
  });
  angular.forEach({
    true: true, false: false, 0: false, 1: true
  }, function(expected, value) {
    it('should set the `keepSize` option to '+expected+' with interpolated attribute valued at '+
    value, function() {
      $rootScope.val = value;
      element = $compile('<div draggable drag-keep-size="{{val}}"></div>')($rootScope);
      expect(!!$drag.draggable(element, false).options.keepSize).toEqual(expected);
    });
  });

  it('should set the `dragWithin` option to the passed string', function() {
    element = $compile('<div draggable drag-within="body"></div>')($rootScope);
    expect($drag.draggable(element, false).options.dragWithin).toEqual('body');
  });


  it('should set the `dragWithin` option to the interpolated attribute value', function() {
    $rootScope.dragWithin = "body";
    element = $compile('<div draggable drag-within="{{dragWithin}}"></div>')($rootScope);
    expect($drag.draggable(element, false).options.dragWithin).toEqual('body');
  });


});
