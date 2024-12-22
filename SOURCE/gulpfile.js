const
  { src, dest, watch, parallel, series } = require('gulp'),
  autoPrefixer = require('gulp-autoprefixer'),
  concat = require('gulp-concat-util'),
  noop = require('gulp-noop'),
  plumber = require('gulp-plumber'),
  sass = require('gulp-sass')(require('sass')),
  server = require('browser-sync').create(),
  sourcemaps = require('gulp-sourcemaps'),
  terser = require('gulp-terser'),
  removeSourceMaps = require('gulp-remove-sourcemaps'),
  cleanCSS = require('gulp-clean-css');

/* ======================================================================== */
/* SETUP */
/* ======================================================================== */
const
  compilation = {
    src: '.', // source dir (current)
    dist: '../HTML', // compilation dir
    minify: false
  };

/* ======================================================================== */
/* PATHS TO RESOURCES */
/* ======================================================================== */
const
  path = {
    scripts: {
      concat: {
        vendor: [compilation.src + '/static/js/concat/vendor/**/*.js'],
        framework: [compilation.src + '/static/js/concat/framework/**/*.js'],
      },
      separate: [
        compilation.src + '/static/js/separate/**/*.js'
      ],
    },
    styles: {
      components: [
        compilation.src + '/static/sass/helpers/*.sass',
        compilation.src + '/static/sass/mixins.sass',
        compilation.src + '/static/sass/vars.sass',
        compilation.src + '/static/sass/*.sass',
        compilation.src + '/components/**/*.sass',
      ],
      vendor: [
        compilation.src + '/static/sass/libraries/*.css',
        compilation.src + '/static/sass/libraries/*.sass',
      ]
    },
    watch: [
      compilation.dist + '/**/*.*', // watch for all files changes in compilation dir
      '!' + compilation.dist + '/**/*.+(js|css|map)', // don't watch for files that are complied (those are handled by browser-sync)
    ]
  };

/* ======================================================================== */
/* SCRIPTS */
/* ======================================================================== */
function JSConcatVendor() {
  return src(path.scripts.concat.vendor, {
    allowEmpty: true
  })
    .pipe(plumber())
    .pipe(concat('vendor.js'))
    .pipe(compilation.minify ? terser() : noop())
    .pipe(dest(`${compilation.dist}/js`))
    .pipe(server.reload({
      stream: true
    }));
}

function JSConcatFramework() {
  return src(path.scripts.concat.framework, {
    allowEmpty: true
  })
    .pipe(plumber())
    .pipe(concat('framework.js'))
    .pipe(compilation.minify ? noop() : sourcemaps.write('/'))
    .pipe(compilation.minify ? terser() : noop())
    .pipe(dest(`${compilation.dist}/js`))
    .pipe(server.reload({
      stream: true
    }));
}

function JSSeparateVendor() {
  return src(path.scripts.separate, {
    allowEmpty: true
  })
    .pipe(plumber())
    .pipe(dest(`${compilation.dist}/js/vendor`))
    .pipe(server.reload({
      stream: true
    }));
}

/* ======================================================================== */
/* STYLES */
/* ======================================================================== */
function CSSVendor() {
  return src(path.styles.vendor, {
    allowEmpty: true
  })
    .pipe(plumber())
    .pipe(sass({
      allowEmpty: true,
    }).on('error', sass.logError))
    .pipe(concat('vendor.css'))
    .pipe(cleanCSS())
    .pipe(removeSourceMaps())
    .pipe(dest(`${compilation.dist}/css`))
    .pipe(server.reload({
      stream: true
    }));
}

function CSSComponents() {
  return src(path.styles.components)
    .pipe(plumber())
    .pipe(compilation.minify ? noop() : sourcemaps.init())
    .pipe(concat('main.sass'))
    .pipe(sass({
      allowEmpty: true,
      outputStyle: compilation.minify ? 'compressed' : 'expanded'
    }).on('error', sass.logError))
    .pipe(autoPrefixer())
    .pipe(compilation.minify ? cleanCSS({
      format: {
        spaces: {
          aroundSelectorRelation: true,
          beforeBlockBegins: true,
          beforeValue: true
        }
      }
    }) : noop())
    .pipe(compilation.minify ? noop() : sourcemaps.write('/'))
    .pipe(dest(`${compilation.dist}/css`))
    .pipe(server.reload({
      stream: true
    }));
}

/* ======================================================================== */
/* BROWSER SYNC */
/* ======================================================================== */
function browserSync(done) {
  server.init({
    server: compilation.dist,
    cors: true
  });

  done();
}

function browserSyncReload(done) {
  server.reload();
  done();
}

/* ======================================================================== */
/* WATCHER */
/* ======================================================================== */
function watcher() {
  watch(path.scripts.separate, JSSeparateVendor);
  watch(path.scripts.concat.vendor, JSConcatVendor);
  watch(path.scripts.concat.framework, JSConcatFramework);

  watch(path.styles.vendor, CSSVendor);
  watch(path.styles.components, CSSComponents);

  watch(path.watch, browserSyncReload);
}

exports.default = series(
  parallel(JSConcatVendor, JSConcatFramework, JSSeparateVendor, CSSVendor, CSSComponents),
  browserSync,
  watcher
);
