/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'textup-frontend',
    environment: environment,
    baseURL: '/',
    locationType: 'hash',
    EmberENV: { FEATURES: {} },
    APP: {},

    hasCordova: process.argv.some(obj => obj === '--cordova'),
    apiKeys: { mapbox: process.env.TEXTUP_FRONTEND_API_MAPBOX },
    gReCaptcha: { siteKey: process.env.TEXTUP_FRONTEND_API_GOOGLE_RECAPTCHA },
    locationPreview: {
      host: 'https://api.mapbox.com/v4/mapbox.streets',
      maxWidth: 1280,
      maxHeight: 1280,
    },
    lock: { lockOnHidden: true, maxNumAttempts: 4 },
    moment: { includeTimezone: 'subset', outputFormat: 'llll' },
    socket: { authKey: process.env.TEXTUP_FRONTEND_API_PUSHER },
    storage: { namespace: 'textup' },
    appMessage: {
      messageEndpoint: 'https://static.textup.org/latest-message/',
      oldestMessageInDays: 14,
    },
    links: {
      supportHub: 'https://www.textup.org/embedded-search',
      privacyPolicy: 'https://static.textup.org/privacy-policy/',
      termsOfUse: 'https://static.textup.org/terms-of-use/',
    },
    state: {
      ignoreTracking: ['reset', 'setup', 'notify'],
      ignoreLock: ['setup', 'notify'],
    },
    events: {
      auth: { success: 'authSuccess', clear: 'authClear' },
      storage: { updated: 'storageUpdated' },
      visibility: {
        change: 'visibilityChange',
        visible: 'visibilityVisible',
        hidden: 'visibilityHidden',
      },
    },
  };

  if (environment === 'development') {
    // ENV.host = 'http://localhost:8080';
    ENV.host = 'https://dev.textup.org';
    // ENV.host = 'https://v2.textup.org';

    // ENV.lock.lockOnHidden = false;
    ENV.appMessage.messageEndpoint = 'http://staging-static.textup.org/latest-message/';
    ENV.links.privacyPolicy = 'http://staging-static.textup.org/privacy-policy/';
    ENV.links.termsOfUse = 'http://staging-static.textup.org/terms-of-use/';
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
    // TODO: hasCordova remove once main branched
    if (process.env.TRAVIS_BRANCH === 'master' || ENV.hasCordova) {
      ENV.host = process.env.TEXTUP_FRONTEND_HOST_PRODUCTION;
      ENV.analytics = {
        options: { limitRouteInformation: true },
        integrations: [
          {
            name: 'GoogleAnalytics',
            config: {
              id: process.env.TEXTUP_FRONTEND_API_GOOGLE_ANALYTICS,
              set: { anonymizeIp: true },
            },
          },
        ],
      };
    } else {
      ENV.host = process.env.TEXTUP_FRONTEND_HOST_STAGING;
    }
  }

  return ENV;
};
