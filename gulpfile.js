const { src, dest, series, watch } = require('gulp');

const ghPages = require('gulp-gh-pages');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass')(require('sass'));
const csso = require('gulp-csso');
const group_media = require("gulp-group-css-media-queries");
const include = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const changed = require('gulp-changed');
const ttf2woff2 = require('gulp-ttf2woff2');
const ttf2woff = require('gulp-ttf2woff');
const del = require('del');
// const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const sync = require('browser-sync').create();

const prod = false;

function html() {
  if (prod) {
    return src('src/**.html')
      .pipe(include({
        prefix: '@@',
      }))
      .pipe(htmlmin({
        collapseWhitespace: true
      }))
      .pipe(dest('dist'))
  } else {
    return src('src/**.html')
      .pipe(include({
        prefix: '@@',
      }))
      .pipe(dest('dist'))
  }

}

function scss() {
  if (prod) {
    return src('src/scss/**.scss')
      .pipe(sass())
      .pipe(group_media())
      .pipe(autoprefixer(
        {
          overrideBrowserslist: ['last 5 versions'],
          grid: true,
        }
      ))
      .pipe(csso())
      .pipe(dest('dist'))
  } else {
    return src('src/scss/**.scss')
      .pipe(sass())
      .pipe(group_media())
      .pipe(autoprefixer(
        {
          overrideBrowserslist: ['last 5 versions'],
          grid: true,
        }
      ))
      .pipe(dest('dist'))
  }

}

function scripts() {
  if (prod) {
    return src('src/js/**.js')
      .pipe(include({
        prefix: '@@',
      }))
      .pipe(uglify())
      .pipe(dest('dist'))
  } else {
    return src('src/js/**.js')
      .pipe(include({
        prefix: '@@',
      }))
      .pipe(dest('dist'))
  }

}

function image() {
  return src('src/img/**/*.{jpg,png,svg,gif,ico,webp}')
    .pipe(dest('dist/img'))
}

function ttf(done) {
  src('src/fonts/**/*.ttf')
    .pipe(changed('dist/fonts', {
      extension: '.woff2',
      hasChanged: changed.compareLastModifiedTime
    }))
    .pipe(ttf2woff2())
    .pipe(dest('dist/fonts'))

  src('src/fonts/**/*.ttf')
    .pipe(changed('dist/fonts', {
      extension: 'woff',
      hasChanged: changed.compareLastModifiedTime
    }))
    .pipe(ttf2woff())
    .pipe(dest('dist/fonts'))
  done();
}


function clear() {
  return del('dist')
}

function serve() {
  sync.init({
    server: './dist'
  })

  watch('src/img/**/**.{jpg,png,svg,gif,ico,webp}', series(image)).on('change', sync.reload)
  watch('src/js/**/**.js', series(scripts)).on('change', sync.reload)
  watch('src/**/**.html', series(html)).on('change', sync.reload)
  watch('src/scss/**/**.scss', series(scss)).on('change', sync.reload)
}

gulp.task('deploy', function () {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});




exports.build = series(clear, ttf, image, scripts, html, scss)
exports.serve = series(clear, ttf, image, scripts, html, scss, serve)
exports.clear = clear;


