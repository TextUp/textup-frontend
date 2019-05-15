/* jshint node: true */
module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'textup-frontend',
    environment: environment,
    rootURL: '/',
    locationType: 'hash',
    EmberENV: {
      FEATURES: {},
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },
    APP: {},

    // Default options from `broccoli-manifest` are merged in during the build process but these
    // default values seem to not be available to our classes unless we explicitly declare them here
    // see https://github.com/racido/broccoli-manifest
    manifest: { enabled: true },
    hasCordova: process.argv.some(obj => obj === '--cordova'),
    apiKeys: { mapbox: process.env.TEXTUP_FRONTEND_API_MAPBOX },
    gReCaptcha: { siteKey: process.env.TEXTUP_FRONTEND_API_GOOGLE_RECAPTCHA },
    captcha: {
      // endpoint: 'http://localhost:3000/human-verification',
      endpoint: 'https://services.textup.org/human-verification',
      location: 'app',
    },
    locationPreview: {
      host: 'https://api.mapbox.com/v4/mapbox.streets',
      maxWidth: 1280,
      maxHeight: 1280,
    },
    lock: {
      lockOnHidden: true,
      maxNumAttempts: 3,
      ignoreLockRouteNames: ['reset', 'setup', 'notify'],
    },
    moment: { includeTimezone: 'subset', outputFormat: 'llll' },
    socket: { authKey: process.env.TEXTUP_FRONTEND_API_PUSHER },
    appMessage: {
      messageEndpoint: 'https://staging-static.textup.org/latest-message/',
      oldestMessageInDays: 14,
    },
    links: {
      privacyPolicy: 'https://staging-static.textup.org/privacy-policy/',
      supportHubEmbedded: 'https://www.textup.org/embedded-search',
      supportHubNativeApp: 'https://www.textup.org/native-app-support',
      termsOfUse: 'https://staging-static.textup.org/terms-of-use/',
    },
    state: { ignoreRestoreStoredUrlRouteNames: ['reset', 'setup', 'notify'] },
    events: {
      auth: { success: 'authSuccess', clear: 'authClear' },
      lock: { unlocked: 'unlocked' },
      storage: { updated: 'storageUpdated' },
      visibility: { visible: 'visibilityVisible', hidden: 'visibilityHidden' },
    },
  };

  if (environment === 'development') {
    // ENV.host = 'http://localhost:8080';
    // ENV.host = 'https://dev.textup.org';
    ENV.host = 'https://v2.textup.org'; // TODO restore

    ENV.lock.lockOnHidden = false;
    ENV.manifest.enabled = false;

    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';

    ENV['ember-prop-types'] = { throwErrors: true };
  }

  if (environment === 'production') {
    // TODO: set up automated deployment for cordova apps
    if (process.env.TRAVIS_BRANCH === 'master' || ENV.hasCordova) {
      ENV.host = process.env.TEXTUP_FRONTEND_HOST_PRODUCTION;
      ENV.appMessage.messageEndpoint = 'https://static.textup.org/latest-message/';
      ENV.links.privacyPolicy = 'https://static.textup.org/privacy-policy/';
      ENV.links.termsOfUse = 'https://static.textup.org/terms-of-use/';
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
