export default [
  {
    id: 'addContact',
    title: 'Add a contact',
    text:
      'Before you can message clients, you have to add a contact. Click the Add Contact button and add our Customer Support Line as a contact.',
    elementsToPulse: ['#tour-openNewContactButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-addNewContactButton'],
  },
  {
    id: 'sendMessage',
    title: 'Send a message',
    text:
      "Now let's send a text. Click the Compose button. If you don't know who to message, you can message the Customer Support contact you just added.",
    elementsToPulse: ['#tour-openMessageButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-openMessageButtonMobile'],
  },
  {
    id: 'makeCall',
    title: 'Make a call',
    text:
      "You can also make calls through TextUp. These calls will appear on caller ID as coming from your TextUp phone number-- even if you're accessing TextUp on a mobile phone. Click the Call button.",
    elementsToPulse: ['#tour-openCallButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-openCallButtonMobile'],
  },
  {
    id: 'setAvailability',
    title: 'Set your availability',
    text:
      'You can choose how and how often you want to be notified of incoming calls and texts to your TextUp phone number. Customize your availability schedule, away message, voicemail, and more by clicking the Availability button',
    elementsToPulse: ['#tour-openAvailabilityButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-openAvailabilityButtonMobile'],
  },
  {
    id: 'createTag',
    title: 'Create a tag',
    text:
      "You can also send the same message to multiple clients at once by putting them in a tag. These are not group messages; it's the same message being sent to many people individually.  Create a tag by clicking the Tag button.",
    elementsToPulse: ['#tour-openTagsListButton', '#tour-createNewTagButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-createNewTagButtonMobile'],
  },
  {
    id: 'exportMessage',
    title: 'Export message records',
    text:
      'You can export your TextUp records to a PDF by clicking the Export button. You can export records for one or many clients at once.',
    elementsToPulse: ['#tour-openExportButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-openExportButtonMobile'],
  },
  {
    id: 'additionalActions',
    title: 'Additional Actions',
    text:
      'You can supplement client records with case notes (text notes, images, or gps locations), schedule messages to send to clients in the future, and more by selecting a contact and then pressing the + button next to the text bar.',
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
