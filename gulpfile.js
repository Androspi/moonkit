const { src, dest, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));

function buildStyles() {
  return src('src/styles/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(dest('dist'));
};

exports.default = series(buildStyles);