export default [
  {
    id: 'addContact',
    title: 'Add a contact',
    text: 'You can add multiple phone numbers to a contact if needed.',
    elementsToPulse: ['#tour-openContactListButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-addNewContactButton']
  },
  {
    id: 'sendMessage',
    title: 'Send a message',
    text: 'Schedule future messages by clicking the + button.',
    elementsToPulse: ['#tour-openMessageButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-openMessageButtonMobile']
  },
  {
    id: 'makeCall',
    title: 'Make a call',
    text: "Your TextUp phone number is what displays on clients' caller ID.",
    elementsToPulse: ['#tour-openCallButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-openCallButtonMobile']
  },
  {
    id: 'setAvailability',
    title: 'Set your availability',
    text: "Determine when you want notifications of work calls and texts-- and when you don't.",
    elementsToPulse: ['#tour-openAvailabilityButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-openAvailabilityButtonMobile']
  },
  {
    id: 'createTag',
    title: 'Create a tag',
    text: 'Send the same message to many clients at once.',
    elementsToPulse: ['#tour-openTagsListButton', '#tour-createNewTagButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-createNewTagButtonMobile']
  },
  {
    id: 'exportMessage',
    title: 'Export message records',
    text: 'Supplement records with case notes by clicking the + button.',
    elementsToPulse: ['#tour-openExportButton'],
    elementsToPulseMobile: ['#tour-openSlideoutButton', '#tour-openExportButtonMobile']
  }
];
