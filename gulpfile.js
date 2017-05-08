var gulp = require('gulp');
var sass = require('gulp-sass');
var git = require('gulp-git');
var bump = require('gulp-bump');
var fs = require('fs');

var pkg_file;
var tag_message;

gulp.task('default', function () {
  console.log(tag_message);
});

var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

gulp.task('sass', function () {
  return gulp
    .src('./src/stylesheets/**/*')
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('tag', function(){
  pkg_file = JSON.parse(fs.readFileSync('./dist/package.json'));
  tag_message = 'From: ' + pkg_file.version + ' to: ' + (parseFloat(pkg_file.version) + 0.1) + '.0';

  gulp.src('./dist/package.json')
    .pipe(bump({ type:'minor' }))
    .pipe(gulp.dest('./dist/'));

  git.tag(pkg_file.version, tag_message, function (err) {
    if (err) throw err;
  });
});

gulp.task('checkout', function(){
  git.checkout('master', function (err) {
    if (err) throw err;
  });
});

gulp.task('merge', function(){
  git.merge('develop', function (err) {
    if (err) throw err;
  });
});

gulp.task('push', function(){
  git.push('origin', 'master', function (err) {
    if (err) throw err;
  });
});

gulp.task('tags', function(){
  git.exec({args : 'push origin master --tags'}, function (err, stdout) {
    if (err) throw err;
  });
});

gulp.task('build', ['sass']);

gulp.task('prod', ['build', 'checkout', 'merge', 'tag', 'push', 'tags']);