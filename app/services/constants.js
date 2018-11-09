import Ember from 'ember';

export default Ember.Service.extend({
  LANGUAGES: [
    'CHINESE',
    'ENGLISH',
    'FRENCH',
    'GERMAN',
    'ITALIAN',
    'JAPANESE',
    'KOREAN',
    'PORTUGUESE',
    'RUSSIAN',
    'SPANISH'
  ],
  COLOR: {
    BRAND: '#1ba5e0',
    LIGHT_BLUE: '#76c9ec',
    LIGHT_GRAY: '#d3d3d3'
  },
  DEFAULT_TIME_INTERVAL_IN_MINUTES: 15,
  DAYS_OF_WEEK: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  MODEL: {
    STAFF: 'staff',
    TEAM: 'team',
    CONTACT: 'contact',
    TAG: 'tag'
  },
  TOOLTIP: {
    SIDE: {
      TOP: 'top',
      BOTTOM: 'bottom',
      RIGHT: 'right',
      LEFT: 'left'
    }
  },
  SLIDEOUT: {
    OUTLET: {
      DEFAULT: 'slideout',
      DETAIL: 'details-slideout'
    },
    DIRECTION: {
      LEFT: 'left',
      RIGHT: 'right'
    },
    FOOTER: {
      ACTIONS: 'slideout-pane/actions'
    },
    DEFAULT_IGNORE_CLOSE_SELECTOR:
      '.textup-account-switcher, .c-notification__container, .datetime-control-wormhole, .pswp, .pop-over__body'
  },
  INFINITE_SCROLL: {
    DIRECTION: { UP: 'up', DOWN: 'down' }
  },
  PHOTO_CONTROL: {
    DISPLAY: { GRID: 'image-grid', STACK: 'image-stack' }
  },
  IMAGE: { DEFAULT_ALT: 'User provided image' },
  AUDIO: { MAX_DURATION_IN_SECONDS: 180 },
  FUTURE_MESSAGE: {
    TYPE: {
      CALL: 'CALL', // need to capitalized to match
      TEXT: 'TEXT'
    },
    INTERVAL_SIZE: { DAY: 1, WEEK: 7 }
  },
  CONTACT: {
    STATUS: {
      UNREAD: 'UNREAD',
      ACTIVE: 'ACTIVE',
      ARCHIVED: 'ARCHIVED',
      BLOCKED: 'BLOCKED'
    }
  },
  SHARING_PERMISSION: { DELEGATE: 'DELEGATE', VIEW: 'VIEW' },
  ACTION: {
    MEDIA: { ADD: 'ADD', REMOVE: 'REMOVE' }
  },
  POP_OVER: {
    POSITION: { TOP: 'top', BOTTOM: 'bottom' }
  }
});
