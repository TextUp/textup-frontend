/* eslint-env node */

var BabelTranspiler = require('broccoli-babel-transpiler');
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    // see https://github.com/ember-cli/ember-cli-preprocessor-registry/issues/8#issuecomment-281373733
    minifyCSS: {
      options: { processImport: false },
    },
    minifyJS: {
      enabled: false,
    },
    sassOptions: { includePaths: ['node_modules'] },
  });

  app.import(app.bowerDirectory + '/mapbox.js/mapbox.js');
  app.import(app.bowerDirectory + '/mapbox.js/mapbox.css');

  var faTree = new Funnel(app.project.root + '/node_modules/font-awesome/fonts', {
    srcDir: '/',
    include: ['*.*'],
    destDir: '/assets/fonts',
  });
  var mapboxTree = new Funnel(app.bowerDirectory + '/mapbox.js/images', {
    srcDir: '/',
    include: ['*.*'],
    destDir: '/assets/images',
  });
  // [FUTURE] upgrade to Ember 2.15 for native support using app.import to import files
  // from node_modules directly
  var cookieConsentTree = new Funnel(app.project.root + '/node_modules/cookieconsent/build', {
    srcDir: '/',
    include: ['*.css'],
    destDir: '/assets/css',
  });

  var mp3EncoderTree = new Funnel(app.project.root + '/node_modules/lamejs', {
    srcDir: '/',
    include: ['lame.min.js'],
    destDir: '/workers/encoders',
  });
  var webworkersTree = new Funnel(
    new BabelTranspiler(app.project.root + '/app/workers', { browserPolyfill: true }),
    {
      srcDir: '/',
      include: ['*'],
      destDir: '/workers',
    }
  );

  return app.toTree(
    mergeTrees([faTree, mapboxTree, cookieConsentTree, mp3EncoderTree, webworkersTree])
  );
};
