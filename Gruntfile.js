'use strict';
module.exports = function (grunt) {

	// require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	var supportedBrowsers = [
		"Android 2.3",
		"Android >= 4",
		"Chrome >= 20",
		"Firefox >= 24",
		"Explorer >= 8",
		"iOS >= 6",
		"Opera >= 12",
		"Safari >= 6"
	];

	grunt.initConfig({

		// Metadata.
		pkg: grunt.file.readJSON('package.json'),

		banner: '/*!\n' +
		' * <%= pkg.name.split("-").join(" ").toUpperCase() %> <%= pkg.version %> (<%= pkg.homepage %>)\n' +
		' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
		' */\n',


		// Lint before committing
		// TODO, elevate the task run to test to ensure all code passes testing in addition to linting
		githooks: {
			all: {
				'pre-commit': 'grunt test',
			}
		},


		clean: {
			css: [
				'*.css',
				'*.map'
			],
			js: [
				'*.min.js'
			]
		},

		// LINT
		// Lint less files to ensure everything's up to snuff
		lesslint: {
			options: {
				// NOTE lesslint won't read a .csslintrc file, rules are defined here
				// everything is off, we'll need to allow these to happen
				csslint: {
					'important': false,
					'adjoining-classes': false,
					'known-properties': false,
					'box-sizing': false,
					'box-model': false,
					'overqualified-elements': false,
					'display-property-grouping': false,
					'bulletproof-font-face': false,
					'compatible-vendor-prefixes': false,
					'regex-selectors': false,
					'errors': false,
					'duplicate-background-images': false,
					'duplicate-properties': false,
					'empty-rules': false,
					'selector-max-approaching': false,
					'gradients': false,
					'fallback-colors': false,
					'font-sizes': false,
					'font-faces': false,
					'floats': false,
					'star-property-hack': false,
					'outline-none': false,
					'import': false,
					'ids': false,
					'underscore-property-hack': false,
					'rules-count': false,
					'qualified-headings': false,
					'selector-max': false,
					'shorthand': false,
					'text-indent': false,
					'unique-headings': false,
					'universal-selector': false,
					'unqualified-attributes': false,
					'vendor-prefix': false,
					'zero-units': false
				}
			},
			src: [
				'*.less',
				'!_*.less'
			]
		},

		// Run JS source through JSHint for common errors
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				force: 'false'
			},
			all: [
				'Gruntfile.js',
				'assets/js/*.js',
				'!assets/jsvendor/*',
				'!dist/js/*.js',
				'!tests/qunit/vendor/*',
				'.jshintrc'
			]
		},

		// Search for 'Magic' Numbers in JS code
		buddyjs: {
			src: ['*.js', '!*.min.js'],
			options: {
				reporter: "simple"
			}
		},

		// COMPILE
		// Compile less files to CSS files
		less: {
			options: {
				sourceMapFileInline: true,
				sourceMap: true,
				dumpLineNumbers: true
			},
			files: {
				expand: true,
				cwd: 'assets/less/',
				src: ['*.less', '!_*.less'],
				dest: 'assets/css/',
				ext: '.css'
			}
		},

		postcss: {
			options: {
				browsers: supportedBrowsers,
				map: true,
				processors: [
					require( 'cssnano' )({
						zindex: false,
						sourcemap: true
					})
				],
				zindex: false
			},
			dist: {
				expand: true,
				cwd: 'assets/css/',
				src: ['*.css', '!_*.css'],
				dest: 'dist/assets/css/',
				ext: '.min.css'
			}
		},

		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			js: {
				files: [{
					expand: true,
					cwd: 'assets/js/',
					src: ['*.js', '!_*.js'],
					dest: 'dist/assets/js/',
					ext: '.min.js'
				}]
			}
		},

		usebanner: {
			options: {
				position: 'top',
				banner: '<%= banner %>'
			},
			files: {
				src: ['*.css', '!*.min.css']
			}
		},

		csscomb: {
			options: {
				config: '.csscomb.json'
			},
			dist: {
				expand: true,
				cwd: '',
				src: ['*.css', '!*.min.css'],
				dest: ''
			}
		},

		imagemin: {
			dynamic: {
				files: [{
					expand: true,
					cwd: 'assets/images/',
					src: ['*.{png,jpg,gif}'],
					dest: 'dist/assets/images/'
				}]
			}
		},

		// TEST
		// Run QUnit tests, also does double duty as REPORT as code coverage is generated in this step as well
		qunit: {
			options: {
				force: false,
				coverage: {
					disposeCollector: true,
					src: ['*.js'],
					instrumentedFiles: 'temp/',
					htmlReport: 'report/coverage',
					coberturaReport: 'report/',
					linesThresholdPct: 10
				}
			},
			files: [
				'tests/qunit/**/*.html'
			]
		},

		// REPORT
		// Show comments in source that contain FIXME, TODO, or NOTE
		todo: {
			options: {},
			js: ['<%= jshint.all %>'],
			less: ['<%= less.files.src %>']
		},

		// Static Code Analysis on JS files
		plato: {
			options: {
				jshint : grunt.file.readJSON('.jshintrc'),
				exclude: /\.min\.js$/
			},
			javascript: {
				dest: 'report/plato',
				src: ['*.js']
			}
		},

		// CSS metrics for individual files
		parker: {
			options: {
				file: 'report/parker/index.md',
				colophon: true,
				usePackage: true
			},
			src: [
				'*.css',
				'!*.min.css'
			],
		},

		// WATCH
		// used in dev mode to constantly pass files through the gauntlet
		watch: {
			less: {
				files: [
					'assets/less/*.less'
				],
				tasks: ['build:css']
			},
			js: {
				files: [
					'<%= jshint.all %>'
				],
				tasks: [ 'build:js' ] //
			},
			qunit: {
				files: [
					'tests/qunit/**/*.js',
					'tests/qunit/**/*.html'
				],
				tasks: ['report:js']
			},
			imagemin: {
				files: [
					'*.{png,jpg,gif}'
				],
				tasks: ['imagemin']
			}
		}
	});

	grunt.registerTask('clear:css', [], function() {
		grunt.loadNpmTasks('grunt-contrib-clean');
		grunt.task.run('clean:css');
	});
	grunt.registerTask('clear:js', [], function() {
		grunt.loadNpmTasks('grunt-contrib-clean');
		grunt.task.run('clean:js');
	});
	grunt.registerTask('clear', ['clear:css', 'clear:js']);


	// LINT, JS and LESS
	grunt.registerTask('lint:less', [], function() {
		grunt.loadNpmTasks('grunt-lesslint');
		grunt.task.run('lesslint');
	});
	grunt.registerTask('lint:js', [], function() {
		grunt.loadNpmTasks('grunt-contrib-jshint');
		grunt.loadNpmTasks('grunt-buddyjs');
		grunt.task.run('jshint', 'buddyjs');
	});
	grunt.registerTask('lint', ['lint:less', 'lint:js']);

	// COMPILE, LESS-only currently
	grunt.registerTask('compile:css', [], function() {
		grunt.loadNpmTasks('grunt-contrib-less');
		grunt.task.run('lint:less', 'less');
	});
	grunt.registerTask('compile', ['compile:css']);

	// TEST, JS-only currently
	grunt.registerTask('test:js', [], function() {
		grunt.loadNpmTasks('grunt-qunit-istanbul');
		grunt.task.run('lint:js', 'qunit');
	});
	grunt.registerTask('test', ['test:js']);

	// BUILD, LESS-only currently
	grunt.registerTask('build:css', [], function() {
		grunt.loadNpmTasks('grunt-postcss');
		grunt.loadNpmTasks('grunt-banner');
		grunt.loadNpmTasks('grunt-csscomb');
		grunt.task.run('compile:css', 'postcss', 'usebanner', 'csscomb:dist');
	});
	grunt.registerTask('build:js', [], function() {
		grunt.loadNpmTasks('grunt-contrib-uglify');
		grunt.task.run('clear:js', 'test:js', 'uglify:js');
	});
	grunt.registerTask('build:images', [], function() {
		grunt.loadNpmTasks('grunt-contrib-imagemin');
		grunt.task.run('imagemin');
	});
	grunt.registerTask('build', ['build:css', 'build:js', 'build:images']);

	// REPORT
	grunt.registerTask('report:css', [], function() {
		grunt.loadNpmTasks('grunt-parker');
		grunt.loadNpmTasks('grunt-todo');
		grunt.task.run('parker', 'todo:less');
	});
	grunt.registerTask('report:js', [], function() {
		grunt.loadNpmTasks('grunt-plato');
		grunt.loadNpmTasks('grunt-todo');
		grunt.task.run('test', 'plato', 'todo:js');
	});
	grunt.registerTask('report', ['report:css', 'report:js']);

	// WATCH for development
	grunt.registerTask('default', [], function() {
		grunt.task.run('watch');
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
};
