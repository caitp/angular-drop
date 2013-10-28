var dropFiles = require('./angularDrop');
var sharedConfig = require('./karma-shared.conf');

module.exports = function(config) {
  sharedConfig(config, {testName: 'AngularDrop: jqLite', logFile: 'karma-jqlite.log'});

  config.set({
    files: dropFiles.mergeFilesFor('karma'),
    exclude: dropFiles.mergeFilesFor('karmaExclude'),

    junitReporter: {
      outputFile: 'test_out/jqlite.xml',
      suite: 'jqLite'
    }
  });
};
