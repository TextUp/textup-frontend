export default {
  REQUEST_METHOD: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
  },
  PROP_NAME: {
    MEDIA_ID: 'uid',
    MODEL_NAME: 'constructor.modelName',
    READABLE_IDENT: 'readableIdentifier',
    SHARING_IDENT: 'sharingIdentifier',
    SHARING_PERMISSION: 'permission',
    SHARING_PHONE_ID_BUCKETS: 'sharedWith',
    URL_IDENT: 'urlIdentifier',
    AVAILABLE_NUMBER: 'phoneNumber',
    NEW_NUMBER_ID: 'sid',
  },
  MIME_TYPE: {
    PDF: 'application/pdf',
    JSON: 'application/json',
  },
  EXPORT: {
    FORMAT: { PDF: 'pdf' },
    LARGEST_MAX: 5000,
    TYPE: { SINGLE: 'singleStream', GROUPED: 'groupByEntity' },
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
    'SPANISH',
  ],
  COLOR: {
    BRAND: '#1ba5e0',
    LIGHT_BLUE: '#76c9ec',
    LIGHT_GRAY: '#d3d3d3',
    MEDIUM_BLUE: '#6ab4d4',
    RED: '#c9302c',
  },
  DEFAULT: {
    LANGUAGE: 'ENGLISH',
    TIME_INTERVAL_IN_MINUTES: 15,
    OUTGOING_TEXT_NUM_CHARACTERS: 160 * 10,
  },
  DAYS_OF_WEEK: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  MODEL: {
    CONTACT: 'contact',
    ORG: 'organization',
    PHONE: 'phone',
    RECORD_CALL: 'record-call',
    RECORD_NOTE: 'record-note',
    RECORD_TEXT: 'record-text',
    STAFF: 'staff',
    TAG: 'tag',
    TEAM: 'team',
  },
  TOOLTIP: {
    SIDE: {
      TOP: 'top',
      BOTTOM: 'bottom',
      RIGHT: 'right',
      LEFT: 'left',
    },
  },
  SLIDEOUT: {
    OUTLET: {
      DEFAULT: 'slideout',
      DETAIL: 'details-slideout',
    },
    DIRECTION: {
      LEFT: 'left',
      RIGHT: 'right',
    },
    FOOTER: {
      ACTIONS: 'slideout-pane/actions',
    },
    DEFAULT_IGNORE_CLOSE_SELECTOR:
      '.textup-account-switcher, .c-notification__container, .datetime-control-wormhole, .pswp, .pop-over__body',
  },
  INFINITE_SCROLL: {
    DIRECTION: { UP: 'up', DOWN: 'down' },
  },
  PHOTO_CONTROL: {
    DISPLAY: { GRID: 'image-grid', STACK: 'image-stack' },
  },
  MAX_LENGTH: {
    POSITION: { TOP: 'top', BOTTOM: 'bottom' },
  },
  IMAGE: { DEFAULT_ALT: 'User provided image' },
  AUDIO: { MAX_DURATION_IN_SECONDS: 180 },
  FUTURE_MESSAGE: {
    TYPE: {
      CALL: 'CALL', // need to capitalized to match
      TEXT: 'TEXT',
    },
    INTERVAL_SIZE: { DAY: 1, WEEK: 7 },
  },
  CONTACT: {
    STATUS: {
      UNREAD: 'UNREAD',
      ACTIVE: 'ACTIVE',
      ARCHIVED: 'ARCHIVED',
      BLOCKED: 'BLOCKED',
    },
    FILTER: {
      ALL: 'all',
      UNREAD: 'unread',
      ARCHIVED: 'archived',
      BLOCKED: 'blocked',
    },
  },
  STAFF: {
    STATUS: {
      ADMIN: 'ADMIN',
      BLOCKED: 'BLOCKED',
      PENDING: 'PENDING',
      STAFF: 'STAFF',
    },
    FILTER: {
      ACTIVE: 'active',
      ADMINS: 'admins',
      DEACTIVATED: 'deactivated',
    },
  },
  ORGANIZATION: {
    STATUS: {
      REJECTED: 'REJECTED',
      PENDING: 'PENDING',
      APPROVED: 'APPROVED',
    },
  },
  SHARING_PERMISSION: { DELEGATE: 'DELEGATE', VIEW: 'VIEW' },
  ACTION: {
    MEDIA: { ADD: 'ADD', REMOVE: 'REMOVE' },
    PHONE: {
      DEACTIVATE: 'DEACTIVATE',
      TRANSFER: 'TRANSFER',
      CHANGE_NUMBER: 'NUMBER',
    },
    SHARE: { STOP: 'STOP', MERGE: 'MERGE' },
    NUMBER: { DELETE: 'DELETE', MERGE: 'MERGE' },
  },
  POP_OVER: {
    POSITION: { TOP: 'top', BOTTOM: 'bottom' },
  },
};
