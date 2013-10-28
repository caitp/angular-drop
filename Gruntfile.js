var files = require('./angularDrop').files;
var util = require('./lib/grunt/utils');
var path = require('path');

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-ddescribe-iit');
  grunt.loadNpmTasks('grunt-merge-conflict');
  grunt.loadNpmTasks('grunt-parallel');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadTasks('lib/grunt');
  grunt.loadNpmTasks('grunt-conventional-changelog');
  grunt.loadNpmTasks('grunt-ngdocs-caitp');
  grunt.loadNpmTasks('grunt-gh-pages');

  var DROP_VERSION = util.getVersion();
  var dist = 'angular-drop-' + DROP_VERSION.full;


  // global beforeEach
  util.init();


  grunt.initConfig({
    DROP_VERSION: DROP_VERSION,

    parallel: {
      travis: {
        tasks: [
          util.parallelTask(['test:unit'], {stream: true}),
        ]
      }
    },

    connect: {
      devserver: {
        options: {
          port: 8000,
          hostname: '0.0.0.0',
          base: '.',
          keepalive: true,
          middleware: function(connect, options) {
            return [
              util.rewrite(),
              connect.static(options.base),
              connect.directory(options.base)
            ];
          }
        }
      },
      testserver: {
        options: {
          port: 8000,
          hostname: '0.0.0.0',
          middleware: function(connect, options) {
            return [
              function(req, res, next) {
                // cache GET requests to speed up tests on travis
                if (req.method === 'GET') {
                  res.setHeader('Cache-control', 'public, max-age=3600');
                }

                nest();
              },

              connect.static(options.base)
            ];
          }
        }
      }
    },

    tests: {
      jqlite: 'karma-jqlite.conf.js',
      jquery: 'karma-jquery.conf.js'
    },

    autotest: {
      jqlite: 'karma-jqlite.conf.js',
      jquery: 'karma-jquery.conf.js'
    },

    clean: {
      build: ['build'],
      tmp: ['tmp']
    },

    jshint: {
      drop: {
        files: { src: files['angularDropSrc'] },
        options: { jshintrc: 'src/.jshintrc' }
      }
    },

    build: {
      drop: {
        dest: 'build/angular-drop.js',
        src: util.wrap([files['angularDropSrc']], 'drop'),
      }
    },

    min: {
      drop: 'build/angular-drop.js'
    },

    /**
     * TODO: Provide documentation!
     * docs: {
     *   process: ['build/docs/*.html', 'build/docs/.htaccess']
     * }
     */

    "ddescribe-iit": {
      files: [
        'test/**/*.js',
      ]
    },

    "merge-conflict": {
      files: [
        'src/**/*',
        'test/**/*',
        'docs/**/*',
        'css/**/*'
      ]
    },

    compress: {
      build: {
        options: {archive: 'build/' + dist + '.zip', mode: 'zip'},
        src: ['**'], cwd: 'build', expand: true, dot: true, dest: dist + '/'
      }
    },

    write: {
      versionTXT: { file: 'build/version.txt', val: DROP_VERSION.full },
      versionJSON: { file: 'build/version.json', val: JSON.stringify(DROP_VERSION) }
    }
  });
  
  // alias tasks
  grunt.registerTask('test', 'Run unit tests with Karma', ['package', 'test:unit']);
  grunt.registerTask('test:jqlite', 'Run the unit tests with Karma (jqLite only)', ['tests:jqlite']);
  grunt.registerTask('test:jquery', 'Run the unit tests with Karma (jQuery only)', ['tests:jquery']);
  grunt.registerTask('test:unit', 'Run jqLite and jQuery unit tests with Karma', ['tests:jqlite', 'tests:jquery']);

  grunt.registerTask('minify', ['bower','clean', 'build', 'minall']);
  grunt.registerTask('webserver', ['connect:devserver']);
  grunt.registerTask('package', ['bower','clean', 'buildall', 'minall', 'collect-errors', 'write', 'compress']);
  grunt.registerTask('package-without-bower', ['clean', 'buildall', 'minall', 'collect-errors', 'write', 'compress']);
  grunt.registerTask('ci-checks', ['ddescribe-iit', 'merge-conflict', 'jshint']);
  grunt.registerTask('default', ['package']);
  
  grunt.registerTask('enforce', 'Install commit message enforce script if it doesn\'t exist',
  function() {
    if (!grunt.file.exists('.git/hooks/commit-msg')) {
      grunt.file.copy('misc/validate-commit-msg.js', '.git/hooks/commit-msg');
      require('fs').chmodSync('.git/hooks/commit-msg', '0755');
    }
  });

  // Shell commands
  grunt.registerMultiTask('shell', 'Run shell commands', function() {
    var self = this, sh = require('shelljs');
    self.data.forEach(function(cmd) {
      cmd = cmd.replace('%version%', grunt.file.readJSON('package.json').version);
      cmd = cmd.replace('%PATCHTYPE%', grunt.option('patch') && 'patch' ||
                                       grunt.option('major') &&
                                       'major' || 'minor');
      grunt.log.ok(cmd);
      var result = sh.exec(cmd, {silent: true });
      if (result.code !== 0) {
        grunt.fatal(result.output);
      }
    });
  });

  // Version management
  function setVersion(type, suffix) {
    var file = 'package.json',
        VERSION_REGEX = /([\'|\"]version[\'|\"][ ]*:[ ]*[\'|\"])([\d|.]*)(-\w+)*([\'|\"])/,
        contents = grunt.file.read(file),
        version;
    contents = contents.replace(VERSION_REGEX, function(match, left, center) {
      version = center;
      if (type) {
        version = require('semver').inc(version, type);
      }
      // semver.inc strips suffix, if it existed
      if (suffix) {
        version += '-' + suffix;
      }
      return left + version + '"';
    });
    grunt.log.ok('Version set to ' + version.cyan);
    grunt.file.write(file, contents);
    return version;
  }

  grunt.registerTask('version', 'Set version. If no arguments, it just takes off suffix',
  function() {
    setVersion(this.args[0], this.args[1]);
  });

  grunt.registerTask('docgen', function() {
    var self = this;
    if (typeof self.args[0] === 'string') {
      grunt.config('pkg.version', self.args[0]);
    }
    grunt.task.mark().run('gh-pages');
  });

  return grunt;
};
