'use strict';
var gulp = require('gulp'),
  sass = require('gulp-sass'),
  notify = require('gulp-notify'),
  prefixer = require('gulp-autoprefixer'),
  cssmin = require('gulp-minify-css'),
  uglify = require('gulp-uglify'),
  rigger = require('gulp-rigger'),
  imagemin = require('gulp-imagemin'),
  imageminJpegRecompress = require('imagemin-jpeg-recompress'),
  rimraf = require('rimraf'),
  sourcemaps = require('gulp-sourcemaps'),
  rename = require('gulp-rename'),
  plumber = require('gulp-plumber'),
  watch = require('gulp-watch'),
  connect = require('gulp-connect'),
  webpack = require('webpack'),
  gutil = require("gulp-util"),
  webpackConfig = require('./webpack.config.js'),
  webpackStream = require('webpack-stream'),
  notifier = require('node-notifier'),
  statsLog = {
    colors: true,
    reasons: true
  };

var path = {
  build: {
    html: 'build/',
    js: 'build/js/',
    css: 'build/css/',
    img: 'build/css/images/',
    fonts: 'build/fonts/',
    htaccess: 'build/',
    contentImg: 'build/img/',
  },
  src: {
    html: 'src/template/*.html',
    js: 'src/js/[^_]*.js',
    css: 'src/css/styles.scss',
    cssVendor: 'src/css/vendor/*.*',
    img: 'src/css/images/**/*.*',
    fonts: 'src/fonts/**/*.*',
    contentImg: 'src/img/**/*.*',
    htaccess: 'src/.htaccess'
  },
  watch: {
    html: 'src/template/**/*.html',
    js: 'src/js/**/*.js',
    css: 'src/css/**/*.*',
    img: 'src/css/images/**/*.*',
    contentImg: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*',
    htaccess: 'src/.htaccess',
  },
  clean: './build',
  outputDir: './build/'
};

gulp.task('connect', function() {
  connect.server({
    root: [path.outputDir],
    port: 9999,
    livereload: true,
  });
  gulp.start('notify');
});

// таск для билдинга html
gulp.task('html:build', function() {
  gulp.src(path.src.html)
    .pipe(rigger())
    .pipe(gulp.dest(path.build.html))
    .pipe(connect.reload())
});


gulp.task('image:build', function() {
  gulp.src(path.src.img)
    .pipe(imagemin([
      imagemin.gifsicle(),
      imageminJpegRecompress({
        loops: 4,
        min: 50,
        max: 95,
        quality: 'high'
      }),
      imagemin.optipng(),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest(path.build.img))
    .pipe(connect.reload())
});
gulp.task('imagescontent:build', function() {
  gulp.src(path.src.contentImg)
    .pipe(imagemin([
      imagemin.gifsicle(),
      imageminJpegRecompress({
        loops: 4,
        min: 70,
        max: 80,
        quality: 'medium'
      }),
      imagemin.optipng(),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest(path.build.contentImg))
    .pipe(connect.reload())
});

gulp.task('js:build', (done) => {
  webpack(webpackConfig, onComplete);

  function onComplete(error, stats) {
    if (error) {
      onError(error);
    } else if (stats.hasErrors()) {
      onError(stats.toString(statsLog));
    } else {
      onSuccess(stats.toString(statsLog));
    }
  }

  function onError(error) {
    let formatedError = new gutil.PluginError('webpack', error);
    notifier.notify({
      title: `Error: ${formatedError.plugin}`,
      message: formatedError.message
    });
    done(formatedError);
  }

  function onSuccess(detailInfo) {
    gutil.log('[webpack]', detailInfo);
    done();
  }
  gulp.src(path.src.js)
    // .pipe(gulp.dest(path.build.js))
    // .pipe(uglify())
    // .pipe(rename({ suffix: '.min' }))
    // .pipe(gulp.dest(path.build.js))
    .pipe(connect.reload());
});
gulp.task('cssOwn:build', function() {
  gulp.src(path.src.css)
    //.pipe(sourcemaps.init()) 
    .pipe(sass().on('error', function() {
      gulp.src(path.src.css)
        .pipe(notify("🤔🤔🤔🤔🤔"))
        .pipe(sass().on('error', sass.logError))
    }))
    .pipe(prefixer({
      browsers: ['last 3 version', "> 1%", "ie 8", "ie 7"]
    }))
    .pipe(cssmin())
    .pipe(sourcemaps.write())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(path.build.css))
    .pipe(connect.reload())
});

// gulp.task('sass-node', function () {
//   return gulp.src(path.src.css)
//     .pipe(sass({
//       includePaths: ['node_modules']
//     }))
//     .pipe(gulp.dest(path.build.css));
// });
// билдинг вендорного css
gulp.task('cssVendor:build', function() {
  gulp.src(path.src.cssVendor)
    .pipe(sourcemaps.init())
    .pipe(cssmin())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css))
    .pipe(connect.reload())

});

gulp.task('css:build', [
  'cssOwn:build',
  // 'cssVendor:build'
]);

gulp.task('fonts:build', function() {
  gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
});

gulp.task('htaccess:build', function() {
  gulp.src(path.src.htaccess)
    .pipe(gulp.dest(path.build.htaccess))
});
gulp.task('notify', function() {
  gulp.src(path.src.html)
    .pipe(notify('за сервер 🍺'));
});

gulp.task('build', [
  'html:build',
  'js:build',
  'css:build',
  'fonts:build',
  'htaccess:build',
  'image:build',
  'imagescontent:build',
]);

gulp.task('clean', function(cb) {
  rimraf(path.clean, cb);
});

gulp.task('watch', function() {
  watch([path.watch.html], function(event, cb) {
    gulp.start('html:build');
  });
  watch([path.watch.contentImg], function(event, cb) {
    gulp.start('imagescontent:build');
  });
  watch([path.watch.css], function(event, cb) {
    gulp.start('css:build');
  });
  watch([path.watch.js], function(event, cb) {
    gulp.start('js:build');
  });
  watch([path.watch.img], function(event, cb) {
    gulp.start('image:build');
  });
  watch([path.watch.fonts], function(event, cb) {
    gulp.start('fonts:build');
  });
  watch([path.watch.htaccess], function(event, cb) {
    gulp.start('htaccess:build');
  });
});
gulp.task('default', ['build', 'watch', 'connect']);