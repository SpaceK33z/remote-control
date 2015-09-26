var gulp = require('gulp');
var concat = require('gulp-concat');
var nodemon = require('gulp-nodemon');

var jsFiles = [
    'node_modules/js-cookie/src/js.cookie.js',
    'static/js/ajax.js',
    'static/js/uuid.js',
    'static/js/app.js'
];

function buildJavascript() {
    return gulp.src(jsFiles)
        .pipe(concat('all.js'))
        .pipe(gulp.dest('static'));
}

function watch() {
    return gulp.watch(jsFiles, buildJavascript);
}

function devServer() {
    return nodemon({
        script: 'server.js',
        ignore: ['static/*']
    });
}

gulp.task('development', gulp.parallel(buildJavascript, devServer, watch));

gulp.task('default', gulp.series('development'));
gulp.task('build', gulp.series(buildJavascript));
