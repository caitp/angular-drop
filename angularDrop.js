angularDropFiles = {
  'angularDropSrc': [
    'src/utils.js',
    'src/draggable.js',
    'src/droppable.js',
    'src/provider.js',
    'src/public.js'
  ],

  'angularDropTest': [
    'test/**/*.spec.js',
  ],

  'karma': [
    'bower_components/jquery/jquery.js',
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular-mocks.js',
    'test/jquery_remove.js',
    '@angularDropSrc',
    'src/publish.js',
    '@angularDropTest',
  ],

  'karmaExclude': [
    'test/jquery_alias.js',
  ],

  'karmaJquery': [
    'bower_components/jquery/jquery.js',
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular-mocks.js',
    'test/jquery_alias.js',
    '@angularDropSrc',
    'src/publish.js',
    '@angularDropTest',
  ],

  'karmaJqueryExclude': [
    'test/jquery_remove.js'
  ]
};

if (exports) {
  exports.files = angularDropFiles;
  exports.mergeFilesFor = function() {
    var files = [];

    Array.prototype.slice.call(arguments, 0).forEach(function(filegroup) {
      angularDropFiles[filegroup].forEach(function(file) {
        // replace @ref
        var match = file.match(/^\@(.*)/);
        if (match) {
          files = files.concat(angularDropFiles[match[1]]);
        } else {
          files.push(file);
        }
      });
    });

    return files;
  };
}