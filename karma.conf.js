module.exports = function(config) {
  config.set({
    files: [
      'demo/vendor/angular.min.js',
      'test/vendor/angular-mocks.js',
      'src/*.js',
      'test/**/*.spec.js'
    ],
    frameworks: ['jasmine'],
    plugins: [
      require('karma-coverage'),
      require('karma-jasmine'),
      require('karma-phantomjs-launcher'),
      require('karma-mocha-reporter')
    ],
    browsers: ['PhantomJS'],
    reporters: ['mocha', 'coverage'],
    preprocessors: {
      'src/*.js': ['coverage']
    },
    coverageReporter: {
      reporters: [
        { type: 'text-summary' },
        {
          type: 'html',
          dir: 'test/coverage/'
        },
        {
          type: 'lcov',
          dir: 'test/coverage/'
        }
      ]
    },
    singleRun: true
  });
};
