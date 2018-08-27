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
  SLIDEOUT: {
    DIRECTION: {
      LEFT: 'left',
      RIGHT: 'right'
    },
    DEFAULT_IGNORE_CLOSE_SELECTOR:
      '.textup-account-switcher, .c-notification__container, .datetime-control-wormhole, .pswp'
  },
  INFINITE_SCROLL: {
    DIRECTION: {
      UP: 'up',
      DOWN: 'down'
    }
  },
  PREVIEW_BADGE: {
    DISPLAY_MODE: {
      OUTLINE: 'outline',
      BACKGROUND: 'background'
    }
  },
  PHOTO_CONTROL: {
    DISPLAY: {
      GRID: 'image-grid',
      STACK: 'image-stack'
    }
  },
  IMAGE: {
    DEFAULT_ALT: 'User provided image'
  },
  FUTURE_MESSAGE: {
    TYPE: {
      CALL: 'call',
      TEXT: 'text'
    },
    INTERVAL_SIZE: {
      DAY: 1,
      WEEK: 7
    }
  },
  SHARING_PERMISSION: {
    DELEGATE: 'delegate',
    VIEW: 'view'
  },
  ACTION: {
    MEDIA: {
      ADD: 'add',
      REMOVE: 'remove'
    }
  }
});
