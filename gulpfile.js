var gulp = require('gulp'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    babel = require('babelify'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    watchify = require('watchify');

gulp.task('styles', function () {
  gulp
    .src('index.scss')
    .pipe(sass())
    .pipe(rename('app.css'))
    .pipe(gulp.dest('public'));
})

gulp.task('assets', function () {
  gulp
    .src('assets/*') //glob
    .pipe(gulp.dest('public'));
})

function compile(watch) {
  var bundle = watchify(browserify('./src/index.js', {debug: true}));

  function rebundle() {
    bundle    
      .transform(babel)
      .bundle()
      .on('error', function (err) {
        console.log(err);
        this.emit('end');
      })
      .pipe(source('index.js'))
      .pipe(rename('app.js'))
      .pipe(gulp.dest('public'));
  }

  if (watch) {
    bundle.on('update', function () {
      console.log('--> Bundling...');
      rebundle();
    });
  }

  rebundle();
}

gulp.task('build', function () {
  return compile();
})

gulp.task('watch', function () { return compile(true); });

gulp.task('default', ['styles', 'assets', 'build']);