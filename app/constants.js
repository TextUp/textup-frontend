export default {
  REQUEST_METHOD: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
  },
  REQUEST_HEADER: {
    AUTH: 'Authorization',
    CONTENT_TYPE: 'Content-Type',
  },
  RESPONSE_STATUS: {
    OK: 200,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    TIMED_OUT: 0,
  },
  RESPONSE_KEY: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
  },
  MIME_TYPE: {
    PDF: 'application/pdf',
    JSON: 'application/json',
  },
  PROP_NAME: {
    AVAILABLE_NUMBER: 'phoneNumber',
    FILTER_VAL: 'filterValue',
    MEDIA_ID: 'uid',
    MODEL_NAME: 'modelName',
    NEW_NUMBER_ID: 'sid',
    READABLE_IDENT: 'readableIdentifier',
    SHARING_IDENT: 'sharingIdentifier',
    SHARING_PERMISSION: 'permission',
    SHARING_PHONE_ID_BUCKETS: 'sharedWith',
    TAGS: 'tags',
    URL_IDENT: 'urlIdentifier',
  },
  EXPORT: {
    FORMAT: { PDF: 'pdf' },
    LARGEST_MAX: 5000,
    TYPE: { SINGLE: 'singleStream', GROUPED: 'groupByEntity' },
  },
  VOICE_TYPE: {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
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
    FUTURE_MESSAGE: 'future-message',
    LOCATION: 'location',
    ORG: 'organization',
    PHONE: 'phone',
    RECORD_CALL: 'record-call',
    RECORD_ITEM: 'record-item',
    RECORD_NOTE: 'record-note',
    RECORD_TEXT: 'record-text',
    SCHEDULE: 'schedule',
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
      DEFAULT: 'default-slideout',
      DETAIL: 'detail-slideout',
    },
    DIRECTION: {
      LEFT: 'left',
      RIGHT: 'right',
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
    // preserve this filter order for displaying in template
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
    // preserve this filter order for displaying in template
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
  NOTIFICATION: {
    METHOD: {
      EMAIL: 'EMAIL',
      TEXT: 'TEXT',
    },
    FREQUENCY: {
      IMMEDIATELY: 'IMMEDIATELY',
      QUARTER_HOUR: 'QUARTER_HOUR',
      HALF_HOUR: 'HALF_HOUR',
      HOUR: 'HOUR',
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
  HINT: {
    CONTACT_ADD: 'contactsAddSupport',
    CONTACT_LANGUAGE: 'contactsLanguage',
    CONTACT_NUMBERS: 'contactsNumbers',
    COMPOSE: 'composeRecipient',
    AVAILABILITY: 'setAvailability',
    TAG_LANGUAGE: 'tagLanguage',
    TAG_COLOR: 'tagColor',
  },
  TASK: {
    CONTACT: 'addContact',
    MESSAGE: 'sendMessage',
    CALL: 'makeCall',
    AVAILABILITY: 'setAvailability',
    TAG: 'createTag',
    EXPORT: 'exportMessage',
    CLIENT_RECORD: 'additionalActions',
  },
};
