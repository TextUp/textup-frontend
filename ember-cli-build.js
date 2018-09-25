/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    sassOptions: {
      includePaths: ['bower_components']
    }
  });

  app.import(app.bowerDirectory + '/mapbox.js/mapbox.js');
  app.import(app.bowerDirectory + '/mapbox.js/mapbox.css');

  var faTree = new Funnel(app.bowerDirectory + '/font-awesome/fonts', {
    srcDir: '/',
    include: ['*.*'],
    destDir: '/assets/fonts'
  });
  var mapboxTree = new Funnel(app.bowerDirectory + '/mapbox.js/images', {
    srcDir: '/',
    include: ['*.*'],
    destDir: '/assets/images'
  });
  // [FUTURE] upgrade to Ember 2.15 for native support using app.import to import files
  // from node_modules directly
  var cookieConsentTree = new Funnel(app.project.root + '/node_modules/cookieconsent/build', {
    srcDir: '/',
    include: ['*.css'],
    destDir: '/assets/css'
  });

  return app.toTree(mergeTrees([faTree, mapboxTree, cookieConsentTree]));
};
