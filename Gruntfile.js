module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		distFolder: 'dist',
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'dist/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: [
					'src/*.js',
					'src/classes/*.js'
				],
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		less: {
			dist: {
				options: {
					cleancss: true,
					paths: ['src/less/*.less']
				},
				files: {
					"dist/<%= pkg.name %>.css": "src/less/bootstrap-extras.less"
				}
			}
		},
		watch: {
			js: {
				files: ['src/*.js', 'src/classes/*.js'],
				tasks: ['concat'],
				options: {
					// livereload: true,
				}
			},
			css: {
				files: ['src/less/*.less'],
				tasks: ['less']
			},
			docs: {
				files: ['docs/demos/*.js', 'docs/index.tpl.html'],
				tasks: ['includeSource:js', 'includereplace:demo']
			}
		},
		includereplace: {
			readme: {
				options: {
					globals: {
						name: '<%= pkg.name %>'
					}
				},
				src: 'docs/README.tpl.md',
				dest: 'README.md'
			},
			demo: {
				src: 'docs/index.html',
				dest: 'docs/index.html'
			}
		},
		includeSource: {
			js: {
				options: {
					basePath: '', // The base path to use when expanding files
					baseUrl: '../', // The base URL to use for included files in the final result.
					template: {
						html: {
							js: '<script type="text/javascript" src="{filePath}"></script>',
						}
					}
				},
				files: {
					'docs/index.html': 'docs/index.tpl.html'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-include-replace');
	grunt.loadNpmTasks('grunt-include-source');

	grunt.registerTask('default', ['concat', 'less', 'uglify']);
	grunt.registerTask('dev',     ['includeSource:js', 'includereplace:demo', 'watch']);
	grunt.registerTask('demo',    ['includeSource:js', 'includereplace:demo']);
	grunt.registerTask('readme',  ['includereplace:readme']);
};
