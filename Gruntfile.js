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
  grunt.loadNpmTasks('grunt-bower-release');

  var DROP_VERSION = util.getVersion();
  var dist = 'angular-drop-' + DROP_VERSION.full;


  // global beforeEach
  util.init();

  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    DROP_VERSION: DROP_VERSION,

    pkg: pkg,

    bowerRelease: {
      stable: {
        options: {
          endpoint: 'https://github.com/caitp/angular-drop-bower.git',
          packageName: 'angular-drop',
          stageDir: '.bower-release/',
          main: 'angular-drop.min.js',
          branchName: 'master',
          dependencies: {}
        },
        files: [
          {
            expand: true,
            cwd: 'build/',
            src: ['angular-drop.js', 'angular-drop.min.js', 'angular-drop.min.js.map']
          }
        ]
      }
    },

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
          base: 'build/',
          keepalive: true,
          middleware: function(connect, options) {
            var doc_root = path.resolve(options.base);
            return [
              connect.logger('dev'),
              connect.static(doc_root),
              connect.directory(doc_root)
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

    copy: {
      demohtml: {
        options: {
          // process html files with gruntfile config
          processContent: grunt.template.process
        },
        files: [{
          expand: true,
          src: ["**/*.html"],
          cwd: "misc/demo/",
          dest: "build/"
        }]
      },
      demoassets: {
        files: [{
          expand: true,
          // Don't re-copy html files, we process those
          src: ["**/**/*", "!**/*.html"],
          cwd: "misc/demo",
          dest: "build/"
        }]
      }
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
    },

    'gh-pages': {
      'gh-pages': {
        options: {
          base: 'build',
          repo: 'https://github.com/caitp/angular-drop.git',
          message: 'gh-pages v<%= pkg.version %>',
          add: false
        },
        src: ['**/*']
      }
    },

    ngdocs: {
      options: {
        dest: "build/docs",
        scripts: [
          'angular.js'
        ],
        styles: [
          'docs/css/style.css'
        ],
        navTemplate: 'docs/nav.html',
        title: 'AngularDrop',
        image: 'logo.png',
        imageLink: 'http://caitp.github.io/angular-drop',
        titleLink: 'http://caitp.github.io/angular-drop',
        html5Mode: false,
        analytics: {
          account: 'UA-44389518-1',
          domainName: 'caitp.github.io'
        }
      },
      api: {
        src: ["src/**/*.js", "src/**/*.ngdoc"],
        title: "API Documentation"
      }
    }
  });

  // alias tasks
  grunt.registerTask('test', 'Run unit tests with Karma', ['package', 'test:unit']);
  grunt.registerTask('test:jqlite', 'Run the unit tests with Karma (jqLite only)', ['tests:jqlite']);
  grunt.registerTask('test:jquery', 'Run the unit tests with Karma (jQuery only)', ['tests:jquery']);
  grunt.registerTask('test:unit', 'Run jqLite and jQuery unit tests with Karma', ['tests:jqlite', 'tests:jquery']);

  grunt.registerTask('minify', ['bower','clean', 'build', 'minall']);
  grunt.registerTask('webserver', ['connect:devserver']);
  grunt.registerTask('package', ['bower','clean', 'buildall', 'minall', 'collect-errors', 'write', 'compress', 'copy']);
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

  grunt.registerTask('release', 'Release on bower', ['build', 'bowerRelease']);

  return grunt;
};
