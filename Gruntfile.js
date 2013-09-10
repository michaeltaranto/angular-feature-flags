module.exports = function(grunt) {

    grunt.initConfig({
        connect: {
            server: {
                options: {
                    port: 9999,
                    base: 'demo',
                    keepalive: true
                }
            }
        },

        open: {
            all: {
                path: 'http://localhost:<%= connect.server.options.port %>/index.html'
            }
        },

        karma:{
            unit: {
                options: {
                    frameworks: ['jasmine'],
                    files: [
                        'demo/vendor/angular.min.js',
                        'test/vendor/angular-mocks.js',
                        'src/**/*.js',
                        'test/**/*Spec.js'
                    ],
                    browsers: ['PhantomJS'],
                    singleRun: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('server', ['open', 'connect']);
    grunt.registerTask('test', ['karma']);

};