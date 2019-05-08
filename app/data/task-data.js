import Constants from 'textup-frontend/constants';

export default [
  {
    id: Constants.TASK.CONTACT,
    title: 'Add a contact',
    text:
      'Before you can message clients, you have to add a contact. Click the Add Contact button.',
    elementsToPulse: ['#tour-openNewContactButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-addNewContactButton'],
  },
  {
    id: Constants.TASK.MESSAGE,
    title: 'Send a message',
    text:
      "Now let's send a text. Click the Compose button. If you don't know who to message, you can message the contact you just added.",
    elementsToPulse: ['#tour-openMessageButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-openMessageButtonMobile'],
  },
  {
    id: Constants.TASK.CALL,
    title: 'Make a call',
    text:
      "You can also make calls through TextUp. These calls will appear on caller ID as coming from your TextUp phone number-- even if you're accessing TextUp on a mobile phone. Click the Call button.",
    elementsToPulse: ['#tour-openCallButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-openCallButtonMobile'],
  },
  {
    id: Constants.TASK.AVAILABILITY,
    title: 'Set your notifications',
    text:
      'You can choose how and how often you want to be notified of incoming calls and texts to your TextUp phone number. Customize your notifications schedule, away message, voicemail, and more by clicking the Notifications button',
    elementsToPulse: ['#tour-openAvailabilityButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-openAvailabilityButtonMobile'],
  },
  {
    id: Constants.TASK.TAG,
    title: 'Create a tag',
    text:
      "You can also send the same message to multiple clients at once by putting them in a tag. These are not group messages; it's the same message being sent to many people individually.  Create a tag by clicking the Tag button.",
    elementsToPulse: ['#tour-openTagsListButton', '#tour-createNewTagButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-createNewTagButtonMobile'],
  },
  {
    id: Constants.TASK.EXPORT,
    title: 'Export message records',
    text:
      'You can export your TextUp records to a PDF by clicking the Export button. You can export records for one or many clients at once.',
    elementsToPulse: ['#tour-openExportButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-openExportButtonMobile'],
  },
  {
    id: Constants.TASK.CLIENT_RECORD,
    title: 'Additional Actions',
    text:
      'You can supplement client records with case notes (text notes, images, or gps locations), schedule messages to send to clients in the future, and more by selecting a contact and then pressing the + button next to the text bar.',
    // Sometimes the results in the contacts list don't load fast enough so pulsing doesn't happen
    // but this is an edge case that doesn't affect the rest of the show me functionality
    elementsToPulse: [
      '#tour-openContactListButton',
      '#tour-contactsList .result-item:first-child .entity-display__body > :first-child',
      '.record-actions-control__dropdown-trigger',
    ],
    elementsToPulseMobile: [
      '#tour-contactsList .result-item:first-child .entity-display__body > :first-child',
      '.record-actions-control__dropdown-trigger',
    ],
  },
];
