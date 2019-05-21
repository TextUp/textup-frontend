'use strict';

const BabelTranspiler = require('broccoli-babel-transpiler');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');

module.exports = function(defaults) {
  const app = new EmberApp(defaults, {
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

  const mapboxTree = new Funnel(app.bowerDirectory + '/mapbox.js/images', {
    srcDir: '/',
    include: ['*.*'],
    destDir: '/assets/images',
  });
  // [NOTE] we don't use `app.import` here directly because we want to import entire directories of
  // multiple files. Also, we sometimes want to import these dependencies into separate files
  // so that they are loaded on an as-needed basis rather than bundled in
  const faTree = new Funnel(app.project.nodeModulesPath + '/font-awesome/fonts', {
    srcDir: '/',
    include: ['*.*'],
    destDir: '/assets/fonts',
  });
  const cookieConsentTree = new Funnel(app.project.nodeModulesPath + '/cookieconsent/build', {
    srcDir: '/',
    include: ['*.css'],
    destDir: '/assets/css',
  });
  const mp3EncoderTree = new Funnel(app.project.nodeModulesPath + '/lamejs', {
    srcDir: '/',
    include: ['lame.min.js'],
    destDir: '/workers/encoders',
  });
  const webworkersTree = new Funnel(
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
