/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {});

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  app.import(app.bowerDirectory + '/font-awesome/fonts/fontawesome-webfont.eot', {
    destDir: '/assets/fonts'
  });
  app.import(app.bowerDirectory + '/font-awesome/fonts/fontawesome-webfont.svg', {
    destDir: '/assets/fonts'
  });
  app.import(app.bowerDirectory + '/font-awesome/fonts/fontawesome-webfont.ttf', {
    destDir: '/assets/fonts'
  });
  app.import(app.bowerDirectory + '/font-awesome/fonts/fontawesome-webfont.woff', {
    destDir: '/assets/fonts'
  });
  app.import(app.bowerDirectory + '/font-awesome/fonts/fontawesome-webfont.woff2', {
    destDir: '/assets/fonts'
  });
  app.import(app.bowerDirectory + '/font-awesome/css/font-awesome.css');

  app.import(app.bowerDirectory + '/mapbox.js/mapbox.js');
  app.import(app.bowerDirectory + '/mapbox.js/mapbox.css');
  app.import(app.bowerDirectory + '/mapbox.js/images/icons-000000@2x.png', {
    destDir: '/assets/images'
  });
  app.import(app.bowerDirectory + '/mapbox.js/images/icons-ffffff@2x.png', {
    destDir: '/assets/images'
  });

  app.import(app.bowerDirectory + '/photoswipe/dist/photoswipe.min.js');
  app.import(app.bowerDirectory + '/photoswipe/dist/photoswipe-ui-default.min.js');
  app.import(app.bowerDirectory + '/photoswipe/dist/photoswipe.css');
  app.import(app.bowerDirectory + '/photoswipe/dist/default-skin/default-skin.css');
  app.import(app.bowerDirectory + '/photoswipe/dist/default-skin/default-skin.png', {
    destDir: '/assets'
  });
  app.import(app.bowerDirectory + '/photoswipe/dist/default-skin/default-skin.svg', {
    destDir: '/assets'
  });
  app.import(app.bowerDirectory + '/photoswipe/dist/default-skin/preloader.gif', {
    destDir: '/assets'
  });

  return app.toTree();
};
