'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var browserSync = require('browser-sync');
var webpackStream = require('webpack-stream');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var $ = require('gulp-load-plugins')();

function webpackWrapper(watch, test, callback) {
    var webpackOptions = {
        watch: watch,
        module: {
            // preLoaders: [{ test: /\.js$/, exclude: /node_modules/, loader: 'eslint-loader'}],
            rules: [
                {
                    test: require.resolve("jquery"),
                    use: [
                        {
                            loader: 'expose-loader',
                            options: 'jQuery'
                        },
                        {
                            loader: 'expose-loader',
                            options: '$'
                        }
                    ]
                },
                {
                    test: require.resolve("angular"),
                    use: [{
                        loader: 'expose-loader',
                        options: 'angular'
                    }]
                },
                {
                    test: require.resolve("selectize"),
                    use: [{
                        loader: 'expose-loader',
                        options: 'selectize'
                    }]
                },
                {
                    test: require.resolve("lodash"),
                    use: [{
                        loader: 'expose-loader',
                        options: '_'
                    }]
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'ng-annotate-loader',
                            options: {
                                es6: true
                            }
                        },
                        {
                            loader: 'babel-loader',
                            options: {
                                plugins: [
                                    "transform-runtime"
                                  ],
                                  presets: ['env',"stage-2"],
                                compact: false
                            }
                        }]
                }
            ]
        },
        resolve: {
            alias: {
                'angular-aria': path.resolve(__dirname, '../node_modules/angular-aria/angular-aria.min.js'),
                'angular-sanitize': path.resolve(__dirname, '../node_modules/angular-sanitize/angular-sanitize.min.js'),
                'angular-animate': path.resolve(__dirname, '../node_modules/angular-animate/angular-animate.min.js'),
                selectize: path.resolve(__dirname, '../node_modules/selectize/dist/js/standalone/selectize.min.js'),
                'echarts-wordcloud': path.resolve(__dirname, '../node_modules/echarts-wordcloud/dist/echarts-wordcloud.min.js'),
                angular: path.resolve(__dirname, '../node_modules/angular/angular.min.js')
            }
        },
        plugins: !watch ? [
            new UglifyJsPlugin()
        ] : [],
        stats: false,
        output: {filename: 'index.module.js'}
    };

  if(watch) {
    webpackOptions.devtool = 'cheap-eval-source-map';
  }

  var webpackChangeHandler = function(err, stats) {
    if(err) {
      conf.errorHandler('Webpack')(err);
    }
    stats.compilation.warnings = [];

    $.util.log(stats.toString({
      colors: $.util.colors.supportsColor,
      chunks: false,
      hash: false,
      version: false
    }));
    console.warn("3123131321231231")
    browserSync.reload();
    if(watch) {
      watch = false;
      callback();
    }
  };

  var sources = [ path.join(conf.paths.src, '/app/index.module.js') ];

  return gulp.src(sources)
    .pipe(webpackStream(webpackOptions, null, webpackChangeHandler))
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app')));
}

gulp.task('scripts', function () {
  return webpackWrapper(false, false);
});

gulp.task('scripts:watch', function (callback) {
  return webpackWrapper(true, false, callback);
});

gulp.task('scripts:test', function () {
  return webpackWrapper(false, true);
});

gulp.task('scripts:test-watch', ['scripts'], function (callback) {
  return webpackWrapper(true, true, callback);
});
