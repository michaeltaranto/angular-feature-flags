//--------------------------------
//  MODULES
//--------------------------------
var gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    connect = require('gulp-connect'),
    opn = require('opn'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    header = require('gulp-header'),
    wrap = require('gulp-wrap'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    ngannotate = require('gulp-ng-annotate'),
    karma = require('gulp-karma'),
    ghpages = require('gh-pages'),
    path = require('path'),
    gutil = require('gulp-util'),
    coveralls = require('gulp-coveralls'),
    pkg = require('./package.json'),


//--------------------------------
//  HELPERS
//--------------------------------
    karmaConfig = function(action) {
        return {
            frameworks: ['jasmine'],
            browsers: [ 'PhantomJS' ],
            reporters: [ 'progress', 'coverage' ],
            preprocessors: {
                'src/*.js': ['coverage']
            },
            coverageReporter: {
                reporters: [
                    { type: 'html', dir: 'test/coverage/' },
                    { type: 'lcov', dir: 'test/coverage/' }
                ]
            },
            action: action
        };
    },
    TEST_FILES = 'test/**/*.spec.js',
    SRC_FILES = 'src/*.js',
    KARMA_FILES = [
        'demo/vendor/angular.min.js',
        'test/vendor/angular-mocks.js',
        SRC_FILES,
        TEST_FILES
    ],
    PORT = 9999;


//--------------------------------
//  TASKS
//--------------------------------

gulp.task('lint', function() {
    return gulp.src([
           'demo/scripts/directives.js',
           SRC_FILES,
           TEST_FILES
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});


gulp.task('test', ['clean'], function() {
    return gulp.src(KARMA_FILES)
        .pipe(karma(karmaConfig('run')))
        .on('error', function(err) {
            throw err;
        });
});


gulp.task('clean', function() {
    return gulp.src('test/coverage')
        .pipe(clean());
})


gulp.task('coveralls', ['test'], function() {
  return gulp.src(['test/coverage/**/lcov.info'])
    .pipe(coveralls());
});


gulp.task('connect', function() {
    connect.server({
        root: 'demo',
        port: PORT,
        livereload: true
    });
});


gulp.task('server', ['connect'], function() {
    opn("http://localhost:" + PORT);
});


gulp.task('reload', function() {
    return gulp.src('demo/**/*.*')
        .pipe(connect.reload());
});


gulp.task('build', function () {
    return gulp.src(SRC_FILES)
        .pipe(concat('featureFlags.js'))
        .pipe(wrap('(function(){\n<%= contents %>\n}());'))
        .pipe(header([
            '/*!',
            ' * <%= title %> v<%= version %>',
            ' *',
            ' * © <%= new Date().getFullYear() %>, <%= author.name %>',
            ' */\n\n'
          ].join('\n'), pkg))
        .pipe(ngannotate({ add: true, single_quotes: true }))
        .pipe(gulp.dest('dist/'))
        .pipe(rename('featureFlags.min.js'))
        .pipe(uglify())
        .pipe(header([
            '/*! <%= title %> v<%= version %> © <%= new Date().getFullYear() %> <%= author.name %> */\n'
          ].join(''), pkg))
        .pipe(gulp.dest('dist/'))
        .pipe(gulp.dest('demo/scripts'));
});


gulp.task('dev', ['build','server'], function() {
    gulp.watch(['demo/**/*.*'], ['reload']);
    gulp.watch(['demo/scripts/*.js', TEST_FILES], ['lint']);
    gulp.watch(SRC_FILES, ['lint', 'build']);
    gulp.src(KARMA_FILES)
        .pipe(karma(karmaConfig('watch')));
});

gulp.task('deploy', ['build'], function(done) {
  ghpages.publish(path.join(__dirname, 'demo'), { logger: gutil.log }, done);
});

gulp.task('precommit', ['lint','test','build']);
gulp.task('demo', ['build', 'server']);
gulp.task('default', ['precommit']);