var gulp = require('gulp');
var watch = require('gulp-watch')
var jasmineBrowser = require('gulp-jasmine-browser');

gulp.task('test', function() {
    var filesForTest = ['app/src/**/*.js', 'app/spec/**/*_spec.js', '!app/src/js/main.js'];
    return gulp.src(filesForTest)
        .pipe(watch(filesForTest))
        .pipe(jasmineBrowser.specRunner())
        .pipe(jasmineBrowser.server({port: 8888}));
});