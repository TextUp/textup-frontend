import Ember from 'ember';

export default Ember.Service.extend({
  MIME_TYPE: { PDF: 'application/pdf' },
  EXPORT: {
    FORMAT: { PDF: 'pdf' },
    LARGEST_MAX: 5000,
    TYPE: { SINGLE: 'singleStream', GROUPED: 'groupByEntity' }
  },
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
    MEDIUM_BLUE: '#6ab4d4',
    LIGHT_GRAY: '#d3d3d3'
  },
  DEFAULT: {
    LANGUAGE: 'ENGLISH',
    TIME_INTERVAL_IN_MINUTES: 15,
    OUTGOING_TEXT_NUM_CHARACTERS: 160 * 10
  },
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
  MAX_LENGTH: {
    POSITION: { TOP: 'top', BOTTOM: 'bottom' }
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
  ORGANIZATION: {
    STATUS: {
      REJECTED: 'REJECTED',
      PENDING: 'PENDING',
      APPROVED: 'APPROVED'
    }
  },
  SHARING_PERMISSION: { DELEGATE: 'DELEGATE', VIEW: 'VIEW' },
  ACTION: {
    MEDIA: { ADD: 'ADD', REMOVE: 'REMOVE' },
    PHONE: {
      DEACTIVATE: 'DEACTIVATE',
      TRANSFER: 'TRANSFER',
      CHANGE_NUMBER: 'NUMBER'
    }
  },
  POP_OVER: {
    POSITION: { TOP: 'top', BOTTOM: 'bottom', LEFT: 'left', RIGHT: 'right' }
  }
});
