var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat');
var react = require('gulp-react');

gulp.task('browserify', function() {
    return gulp.src('src/main.js')
      .pipe(react())
      .pipe(browserify({transform:"reactify"}))
      .pipe(concat('main.js'))
      .pipe(gulp.dest('dist'));
});

gulp.task('copyindex', function() {
    gulp.src('src/index.html')
      .pipe(gulp.dest('dist'));
});

gulp.task('build',['browserify','copyindex']);