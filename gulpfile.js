'use strict';

// packages
const _                 = require('underscore');
const autoprefixer      = require('gulp-autoprefixer');
const clean             = require('gulp-clean');
const concat            = require('gulp-concat');
const cssnano           = require('gulp-cssnano');
const data              = require('gulp-data');
const frontMatter       = require('gulp-front-matter');
const fs                = require('fs');
const gulp              = require('gulp');
const Handlebars        = require('Handlebars');
const layout            = require('gulp-layout');
const less              = require('gulp-less');
const markdown          = require('gulp-markdown');
const notify            = require('gulp-notify');
const path              = require('path');
const plumber           = require('gulp-plumber' );
const rename            = require('gulp-rename');
const runSequence       = require('run-sequence');
const shell             = require('gulp-shell');
const tap               = require('gulp-tap');
const uglify            = require('gulp-uglify');

// custom variables
const srcFolder   = 'src/';
const img_srcFolder     = srcFolder + 'images/';
const style_srcFolder   = srcFolder + 'styles/';
const scripts_srcFolder = srcFolder + 'scripts/';

const content_srcFolder = srcFolder + 'content/';
const layouts_srcFolder = srcFolder + 'layouts/';
const partials_srcFolder = srcFolder + 'partials/';

const dest_folder = 'dist/';

// Error / Success Handling
let onError = function(err) {
    notify.onError({
        title: "Error: " + err.plugin,
        subtitle: "<%= file.relative %>",
        message: "<%= error.message %>",
        sound: "Beep",
        icon: "logo/logo.png",
    })(err);
    console.log(err.toString());
    this.emit('end');
};

function onSuccess(msg) {
    return {
        message: msg + " Complete! ",
        //sound:     "Pop",
        icon: "logo/logo.png",
        onLast: true
    }
}

function notifyFunc(msg) {
    return gulp.src('.', { read: false })
        .pipe(notify(onSuccess(msg)))
}

// styles: Compile and Minify style / CSS Files
const style_srcFile     = 'kb-master.less';
const style_destFile    = 'kb-master.min.css';

gulp.task('styles', function() {
  return gulp.src( style_srcFolder + style_srcFile )
    .pipe(plumber({ errorHandler: onError }))
    .pipe(less({ compress: false }))
    .pipe(autoprefixer({ browsers: ['last 4 versions', 'iOS > 7'], remove: false }))
    .pipe(cssnano({ autoprefixer: false, safe: true }))
    .pipe(rename( style_destFile ))
    .pipe(gulp.dest( dest_folder ))
    //.pipe(notify(onSuccess('Styles')))
});

// Rebuild JS
const scripts_destFile  = 'kb-master.min.js';

gulp.task('scripts', function() {
    return gulp.src(scripts_srcFolder + '**/*.js')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(concat(scripts_destFile))
        .pipe(uglify())
        .pipe(gulp.dest( dest_folder ))
        //.pipe(notify(onSuccess('JS')))
});

var Data = {
  pages: {}
};

var Category = {
'Addresses' : {
  slug: 'addresses',
  sort : '1'
},
'Gas and TX Fees' : {
  slug: 'gas-and-tx-fees',
  sort : '2'
},
'Offline' : {
  slug: 'offline',
  sort : '3'
},
'Tokens' : {
  slug: 'tokens',
  sort : '4'
},
'Best Of' : {
  slug: 'best-of',
  sort : '5'
},
'Getting Started' : {
  slug: 'getting-started',
  sort : '6'
},
'Private Keys & Passwords' : {
  slug: 'private-keys-passwords',
  sort : '7'
},
'Transactions' : {
  slug: 'transactions',
  sort : '8'
},
'Diving Deeper' : {
  slug: 'diving-deeper',
  sort : '9'
},
'Hardware Wallets' : {
  slug: 'hardware-wallets',
  sort : '10'
},
'Security & Phishing' : {
  slug: 'security-and-phishing',
  sort : '11'
},
'ENS' : {
  slug: 'ens',
  sort : '12'
},
'Importing / Exporting from MEW' : {
  slug: 'migration',
  sort : '13'
},
'Sending ETH & Tokens' : {
  slug: 'sending',
  sort : '14'
},
'FAQ' : {
  slug: 'faq',
  sort : '15'
},
'Networks' : {
  slug: 'networks',
  sort : '16'
},
'Swap' : {
  slug: 'swap',
  sort : '17'
}
}

gulp.task('generate_page_array', function() {
  return gulp.src(content_srcFolder + '**/*.md')
    .pipe(tap(function(file) {
    var name = path.basename(file.path, ".md");
    var contents = file.contents.toString();
    var index = contents.indexOf("---%");
    if (index !== -1) {
      var data = JSON.parse(contents.slice(0, index));
          data.url = file.relative.replace(".md", ".html");
          data.slug = data.url.replace(".html", "");
      var category = data.category;
          data.catSlug = Category[category]['slug'];
          data.catSort = Category[category]['sort'];
          data.email = 'support@myetherwallet.com';
          data.base_url = 'https://myetherwallet.github.io/knowledge-base/';
          data.slug = data.slug.replace(category+"/", "");
      Data.pages[name] = data;
      contents = contents.slice(index+4, contents.length);
      file.contents = new Buffer(contents, "utf-8");
    }
  }))
});

gulp.task('templates', ['generate_page_array'], function() {
  return gulp.src(layouts_srcFolder + 'single.hbs')
    .pipe(tap(function(file) {
      var template = Handlebars.compile(file.contents.toString());
      return gulp.src(content_srcFolder + '**/*.md')
        .pipe(markdown())
        .pipe(tap(function(file) {
          var name = path.basename(file.path, ".html");
          var data = Data.pages[name]
              data.contents = file.contents.toString();
          var contents = data.contents;
          var index = data.contents.indexOf("---%");
          if (index !== -1) {
            data.contents = data.contents.slice(index+4, contents.length);
          }
          var html = template(data);
          file.contents = new Buffer(html, "utf-8");
        }))
        .pipe(gulp.dest( dest_folder ));
    }));
});

gulp.task('homepage', ['generate_page_array'], function() {
  return gulp.src(layouts_srcFolder + 'index.hbs')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(tap(function(file, t) {
      var template = Handlebars.compile(file.contents.toString());
      var html = template({
        title: "MyEtherWallet Knowledge Base",
        pages: Data.pages
      });
      file.contents = new Buffer(html, "utf-8");
    }))
    .pipe(rename(function(path) {
      path.extname = ".html";
    }))
    .pipe(gulp.dest( dest_folder ));
});

gulp.task('watchJS',       function() { gulp.watch(scripts_srcFolder + '**/*.js' , ['scripts']  )             })

gulp.task('watchSTYLES',   function() { gulp.watch(style_srcFolder + '**/*.less' , ['styles']   )             })

gulp.task('watchCONTENT',  function() { gulp.watch(content_srcFolder + '**/*.md' , ['templates'])             })

gulp.task('watchTEMPLATE', function() { gulp.watch(content_srcFolder + '**/*.hbs', ['templates', 'homepage']) })

gulp.task('watch', ['watchJS', 'watchSTYLES', 'watchCONTENT', 'watchTEMPLATE'])

gulp.task('build', ['scripts', 'styles', 'homepage', 'templates']);

gulp.task('default', ['build', 'watch']);
