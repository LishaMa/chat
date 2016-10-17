var gulp = require('gulp');
var watch = require('gulp-watch');
var jasmineBrowser = require('gulp-jasmine-browser');

gulp.task('test', function() {
    var filesForTest =
        [
            'app/src/lib/jquery-3.1.1.min.js',
            'app/src/emoji/js/emojify.min.js',
            'app/src/lib/jemoji/jemoji.js',
            'app/src/js/*.js',
            'app/src/spec/js/*.html',
            'app/src/jasmine/jasmine-jquery.js',
            'app/src/spec/js/*_spec.js',
            '!app/src/js/main.js'
        ];
    return gulp.src(filesForTest)
        .pipe(watch(filesForTest))
        .pipe(jasmineBrowser.specRunner())
        .pipe(jasmineBrowser.server({port: 8888}));
});





