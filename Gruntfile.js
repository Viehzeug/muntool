// Generated on 2015-09-11 using generator-angular 0.12.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

  /**
   * Load dependencies
   */

  //times grunt build steps
  require('time-grunt')(grunt);

  //wires up bower-files in requirejs main
  // grunt.loadNpmTasks('grunt-bower-requirejs');
  require('load-grunt-tasks')(grunt);

  var NwBuilder = require('nw-builder');

  /**
   * Config Setup
   */
  var appConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist'
  };

  grunt.initConfig({

    //make config avaliable inside tasks
    appConfig: appConfig,

    bowerRequirejs: {
      target: {
        rjsConfig: 'app/main.js',
        options: {
          exclude: ['bootstrap']
        }
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= appConfig.app %>/scripts/**/*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      styles: {
        files: ['<%= appConfig.app %>/styles/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= appConfig.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= appConfig.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function(connect) {
            return [
              connect.static('.tmp'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect().use(
                '/app/styles',
                connect.static('./app/styles')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= appConfig.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= appConfig.app %>/scripts/**/*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },


    compress: {
      mac: {
        options: {
          archive: 'build/muntool/muntool_mac.zip'
        },
        files: [{expand: true, cwd: 'build/muntool/osx64/', src: ['**'], dest: '.'}]
      },
      windows32: {
        options: {
          archive: 'build/muntool/muntool_win32.zip'
        },
        files: [{expand: true, cwd: 'build/muntool/win32/', src: ['**'], dest: 'muntool_win32/'}]
      },
      windows64: {
        options: {
          archive: 'build/muntool/muntool_win64.zip'
        },
        files: [{expand: true, cwd: 'build/muntool/win64/', src: ['**'], dest: 'muntool_win64/'}]
      },
      linux32: {
        options: {
          archive: 'build/muntool/muntool_linux32.zip'
        },
        files: [{expand: true, cwd: 'build/muntool/linux32/', src: ['**'], dest: 'muntool_linux32/'}]
      },
      linux64: {
        options: {
          archive: 'build/muntool/muntool_linux64.zip'
        },
        files: [{expand: true, cwd: 'build/muntool/linux64/', src: ['**'], dest: 'muntool_linux64/'}]
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        options: {
          force: true
        },
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= appConfig.dist %>/{,*/}*'
          ]
        }]
      },
      server: {options: {force: true}, files: [{dot: true, src:['.tmp']}]  },
      webapp: 'webapp/',
      macIcon: {options:{force: true}, files:[{src:'build/muntool/osx64/muntool.app/Contents/Resources/nw.icns'}]}
    },
    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      server: {
        options: {
          map: true,
        },
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= appConfig.dist %>',
          src: '{,*/}*.css',
          dest: '<%= appConfig.dist %>'
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%= appConfig.app %>/index.html'],
        ignorePath: /\.\.\//,
        exclude: [/.*angular.*\.js/, /.*ang.*\.js/, 'requirejs-json', 'requirejs-text', 'text'] /*exclude scripts loaded by requirejs*/
      }
      // ,
      // test: {
      //   devDependencies: true,
      //   src: '<%= karma.unit.configFile %>',
      //   ignorePath:  /\.\.\//,
      //   fileTypes:{
      //     js: {
      //       block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
      //         detect: {
      //           js: /'(.*\.js)'/gi
      //         },
      //         replace: {
      //           js: '\'{{filePath}}\','
      //         }
      //       }
      //     }
      // }
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= appConfig.dist %>/scripts/**/*.js',
          '<%= appConfig.dist %>/styles/{,*/}*.css',
          '<%= appConfig.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= appConfig.dist %>/styles/fonts/*'
        ]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= appConfig.app %>',
          dest: '<%= appConfig.dist %>',
          src: '**/*'
        },
        {
          expand: true,
          dot: true,
          cwd: 'bower_components',
          dest: '<%= appConfig.dist %>/bower_components',
          src: '**/*'
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= appConfig.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      },
      macIcon: {
        cwd: '<%= appConfig.app %>/images/',
        src: 'nw.icns',
        dest: 'build/muntool/osx64/muntool.app/Contents/Resources/',
        expand: true,
        forceOverwrite: true
      }
    }

    // // Test settings
    // karma: {
    //   unit: {
    //     configFile: 'test/karma.conf.js',
    //     singleRun: true
    //   }
    // },

    // nwjs: {
    //   options: {
    //     platforms: ['win','osx'],
    //     buildDir: './webkitbuilds'
    //   },
    //   src: ['./dist/*']
    // }
  });

  /*
   Custom Taks
   */



  grunt.registerTask('build-nwjs', function() {
    var done = this.async();
    var nw = new NwBuilder({
      files: './dist/**/*',
      platforms: ['osx64', 'win32', 'win64', 'linux32', 'linux64'],
      version: '0.12.3'
    });
    nw.on('log', grunt.log.writeln);
    nw.build().then(function() {
      grunt.log.writeln('nw.js build successfull!');
      done();
    }).catch(function(error) {
      grunt.log.error(error);
      done();
    });


  });

  //clean up after wiredep for require-paths
  //replaces the "requirejs-json"-key with "json"-key
  grunt.registerTask('wiredep_require_cleanup', function() {
    var path = 'app/main.js';
    if (!grunt.file.exists(path)) {
      grunt.log.error("file " + path + " not found");
      return false; //return false to abort the execution
    }
    var configText = grunt.file.read(path);
    var match = /requirejs\.config\(([.\s\S]*?\})\);/.exec(configText);
    if (!(/(['"]?)json\1\s*?:/.test(match[1]))) {
      grunt.log.writeln('did not find "json"-key');
      if (/(['"]?)requirejs-json\1\s*?:/.test(match[1])) {
        grunt.log.writeln('but found "requirejs-json"-key - going to replace');
        var configSettings = match[1].replace(/(['"]?)requirejs-json\1\s*?:/, 'json:');
        configText = configText.replace(match[1], configSettings);
        grunt.file.write(path, configText);
        grunt.log.ok('replaced "requirejs-json"-key with "json"-key');
      } else {
        grunt.log.writeln('but also did not find "requirejs-json"-key; no changes were made');
      }
    } else {
      grunt.log.writeln('file already contains "json"-key; no changes were made');
    }
  });

  //wiredep require-paths
  grunt.registerTask('wiredep_require', ['bowerRequirejs', 'wiredep_require_cleanup']);

  //serve
  grunt.registerTask('serve', 'Compile then start a connect web server', function() {
    grunt.task.run([
      'jshint',
      'clean:server',
      'wiredep',
      'wiredep_require',
      'copy:styles',
      'autoprefixer:server',
      'connect:livereload',
      'watch'
    ]);
  });

  //test
  // grunt.registerTask('test', [
  //   'jshint',
  //   'clean:server',
  //   'wiredep',
  //   'wiredep_require',
  //   'copy:styles',
  //   'autoprefixer',
  //   'connect:test',
  //   'karma'
  // ]);

  //build
  grunt.registerTask('build', [
    'jshint',
    'clean:dist',
    'wiredep',
    'wiredep_require',
    'copy:dist'
  ]);

  //generate webapp
  grunt.registerTask('webapp', ['clean:webapp', 'build', 'build-nwjs', 'clean:macIcon', 'copy:macIcon', 'compressgit']);

  //default task is serve
  grunt.registerTask('default', ['serve']);

};