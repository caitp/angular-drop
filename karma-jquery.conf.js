var dropFiles = require('./angularDrop');
var sharedConfig = require('./karma-shared.conf');

module.exports = function(config) {
  sharedConfig(config, {testName: 'AngularDrop: jQuery', logFile: 'karma-jquery.log'});

  config.set({
    files: dropFiles.mergeFilesFor('karmaJquery'),
    exclude: dropFiles.mergeFilesFor('karmaJqueryExclude'),

    junitReporter: {
      outputFile: 'test_out/jquery.xml',
      suite: 'jQuery'
    }
  });
};
