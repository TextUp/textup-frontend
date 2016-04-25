/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
    var app = new EmberApp(defaults, {
        sassOptions: {
            includePaths: [
                'vendor/scss',
                'bower_components/sass-mq'
            ]
        },
    });

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

    // font-awesome is imported by ember-cli-notifications (see environment.js)

    app.import(app.bowerDirectory + "/elessar/dist/elessar.min.js");
    app.import(app.bowerDirectory + "/elessar/elessar.css");

    app.import(app.bowerDirectory + "/mapbox.js/mapbox.js");
    app.import(app.bowerDirectory + "/mapbox.js/mapbox.css");
    app.import(app.bowerDirectory + "/mapbox.js/images/icons-000000@2x.png", {
        destDir: '/assets/images'
    });
    app.import(app.bowerDirectory + "/mapbox.js/images/icons-ffffff@2x.png", {
        destDir: '/assets/images'
    });

    return app.toTree();
};
