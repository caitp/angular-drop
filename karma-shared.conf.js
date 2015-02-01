module.exports = function(config, specificOptions) {
  config.set({
    frameworks: ['jasmine'],
    autoWatch: true,
    logLevel: config.LOG_INFO,
    logColors: true,
    browsers: ['Firefox', 'PhantomJS'],
    browserDisconnectTimeout: 5000,
    reporters: ['dots', 'coverage'],
    preprocessors: {
      'src/*.js': ['coverage']
    },

    coverageReporter: {
      reporters: [
        {
          type: 'lcov',
          dir: 'coverage/'
        },
        {
          type: 'text'
        }
      ]
    },


    // config for Travis CI
    sauceLabs: {
      testName: specificOptions.testName || 'AngularDrop',
      startConnect: false,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    },

    // For more browsers on Sauce Labs see:
    // https://saucelabs.com/docs/platforms/webdriver
    customLaunchers: {
      'SL_Chrome': {
        base: 'SauceLabs',
        browserName: 'chrome'
      },
      'SL_Firefox': {
        base: 'SauceLabs',
        browserName: 'firefox'
      },
      'SL_Safari': {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'Mac 10.8',
        version: '6'
      },
      'SL_IE_8': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '8'
      },
      'SL_IE_9': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 2008',
        version: '9'
      },
      'SL_IE_10': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 2012',
        version: '10'
      }
    }
  });

  function arrayRemove(array, item) {
    var index = array.indexOf(item);
    if (index >= 0) array.splice(index, 1);
  }

  if (process.argv.indexOf('--debug') >= 0) {
    arrayRemove(config.reporters, 'coverage');
    for (var key in config.preprocessors) {
      arrayRemove(config.preprocessors[key], 'coverage');
    }
  }

  if (process.env.TRAVIS) {
    // TODO(vojta): remove once SauceLabs supports websockets.
    // This speeds up the capturing a bit, as browsers don't even try to use websocket.
    config.transports = ['xhr-polling'];
    config.reporters.push('coveralls');

    // Debug logging into a file, that we print out at the end of the build.
    config.loggers.push({
      type: 'file',
      filename:  'logs/' + (specificOptions.logFile || 'karma.log'),
      level: config.LOG_DEBUG
    });
  }
};
