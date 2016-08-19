/* jshint node: true */

module.exports = function(environment) {
    var ENV = {
        modulePrefix: 'textup-frontend',
        environment: environment,
        apiKeys: {
            mapbox: 'pk.eyJ1IjoiZXJpY2JhaSIsImEiOiJjaWdwMXdhMWwwMGhxc3hrbm44dzdwaGFzIn0.MI2T3IHOtoE3s7ABwbDXfw'
        },
        baseURL: '/',
        locationType: 'hash',
        EmberENV: {
            FEATURES: {
                // Here you can enable experimental features on an ember canary build
                // e.g. 'with-controller': true
            }
        },

        APP: {
            // Here you can pass flags/options to your application instance
            // when it is created
        },
        moment: {
            includeTimezone: '2010-2020'
        },
        storage: {
            namespace: 'textup'
        },
        socket: {
            authKey: '931ddcc6c5780a68022f'
        },
        lock: {
            lockOnHidden: true,
        },
        events: {
            auth: {
                success: 'authSuccess',
                clear: 'authClear'
            },
            storage: {
                updated: 'storageUpdated'
            },
            visibility: {
                change: "visibilityChange",
                visible: "visibilityVisible",
                hidden: "visibilityHidden"
            }
        }
    };

    if (environment === 'development') {
        // ENV.host = "https://5e6aa46b.ngrok.io";
        ENV.host = "https://dev.textup.org";
        // ENV.host = "https://v2.textup.org";

        // ENV.lock.lockOnHidden = false;
        ENV.manifest = {
            enabled: true
        };
        // ENV.APP.LOG_RESOLVER = true;
        // ENV.APP.LOG_ACTIVE_GENERATION = true;
        // ENV.APP.LOG_TRANSITIONS = true;
        // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
        // ENV.APP.LOG_VIEW_LOOKUPS = true;
    }

    if (environment === 'test') {
        // Testem prefers this...
        ENV.baseURL = '/';
        ENV.locationType = 'none';

        // keep test console output quieter
        ENV.APP.LOG_ACTIVE_GENERATION = false;
        ENV.APP.LOG_VIEW_LOOKUPS = false;

        ENV.APP.rootElement = '#ember-testing';
    }

    if (environment === 'production') {
        // ENV.host = "https://5e6aa46b.ngrok.io";
        // ENV.host = "https://dev.textup.org";
        ENV.host = "https://v2.textup.org";
    }

    return ENV;
};
