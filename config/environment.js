/* jshint node: true */

module.exports = function(environment) {
    var ENV = {
        modulePrefix: 'textup-frontend',
        environment: environment,
        apiKeys: {
            mapbox: 'pk.eyJ1IjoiZXJpY2JhaSIsImEiOiJjaWdwMXdhMWwwMGhxc3hrbm44dzdwaGFzIn0.MI2T3IHOtoE3s7ABwbDXfw',
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
        gReCaptcha: {
            siteKey: '6LeXTgkUAAAAAD6AxV0jRU5PDlusBakxwQFNDutq'
        },
        locationPreview: {
            host: 'https://api.mapbox.com/v4/mapbox.streets',
            maxWidth: 1280,
            maxHeight: 1280
        },
        viewportConfig: {
            viewportTolerance: {
                top: 500,
                left: 500,
                bottom: 500,
                right: 500
            }
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
        photoCompression: {
            maxSizeInBytes: 750000,
            maxHeightInPixels: 1024,
            maxWidthInPixels: 1024,
            jpegQuality: 1.0,
            // step size to enable image to fit within size constraint, needs to be between 0 and 1
            // closer to 1 is a more fine-grained (conservative) scaling down
            // closer to 0 is a more coarse-grained (extreme) scaling down
            scalingStep: 0.9,
            orient: true
        },
        state: {
            ignoreTracking: ['reset', 'setup', 'notify'],
            ignoreLock: ['setup', 'notify']
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
        // ENV.host = "https://91b011ee.ngrok.io";
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