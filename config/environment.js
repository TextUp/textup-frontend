/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'textup-frontend',
    environment: environment,
    apiKeys: {
      mapbox: process.env.TEXTUP_FRONTEND_API_MAPBOX
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
      siteKey: process.env.TEXTUP_FRONTEND_API_GOOGLE_RECAPTCHA
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
      includeTimezone: 'subset',
      outputFormat: 'llll'
    },
    storage: {
      namespace: 'textup'
    },
    socket: {
      authKey: process.env.TEXTUP_FRONTEND_API_PUSHER
    },
    lock: {
      lockOnHidden: true
    },
    appMessage: {
      messageEndpoint: 'https://app-messages.textup.org/',
      oldestMessageInDays: 30,
      lastViewedStorageKey: 'textupMessageLastViewed'
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
        change: 'visibilityChange',
        visible: 'visibilityVisible',
        hidden: 'visibilityHidden'
      }
    }
  };

  if (environment === 'development') {
    ENV.host = 'http://localhost:8080';
    // ENV.host = 'https://dev.textup.org';
    // ENV.host = 'https://v2.textup.org';

    // TODO restore
    ENV.lock.lockOnHidden = false;
    // ENV.manifest = {
    //   enabled: true
    // };
    ENV.appMessage.messageEndpoint =
      'http://app-messages.textup.org.s3-website-us-east-1.amazonaws.com/';
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

    ENV['ember-prop-types'] = { throwErrors: true };
  }

  if (environment === 'production') {
    ENV.host =
      process.env.TEXTUP_FRONTEND_TRAVIS_BRANCH === 'master'
        ? process.env.TEXTUP_FRONTEND_HOST_PRODUCTION
        : process.env.TEXTUP_FRONTEND_HOST_STAGING;
    ENV.analytics = {
      options: { limitRouteInformation: true },
      integrations: [
        {
          name: 'GoogleAnalytics',
          config: {
            id: process.env.TEXTUP_FRONTEND_API_GOOGLE_ANALYTICS,
            set: { anonymizeIp: true }
          }
        }
      ]
    };
  }

  return ENV;
};
