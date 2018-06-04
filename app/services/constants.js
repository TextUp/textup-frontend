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
  DAYS_OF_WEEK: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  MODEL: {
    STAFF: 'staff',
    TEAM: 'team'
  },
  SLIDEOUT: {
    DIRECTION: {
      LEFT: 'left',
      RIGHT: 'right'
    },
    DEFAULT_IGNORE_CLOSE_SELECTOR:
      '.textup-account-switcher, .c-notification__container, .datetime-control-wormhole, .pswp'
  },
  PREVIEW_BADGE: {
    DISPLAY_MODE: {
      OUTLINE: 'outline',
      BACKGROUND: 'background'
    }
  }
});
