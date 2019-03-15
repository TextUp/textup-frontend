export default [
  {
    id: 'addContact',
    title: 'Add a contact',
    text: 'You can add multiple phone numbers to a contact if needed.',
    elementToPulse: '#tour-openContactListButton',
    openBeforePulse: '',
    openBeforePulseMobile: '#tour-openSlideoutButton',
    elementToPulseMobile: '#tour-addNewContactButton'
  },
  {
    id: 'sendMessage',
    title: 'Send a message',
    text: 'Schedule future messages by clicking the + button.',
    elementToPulse: '#tour-openMessageButton',
    openBeforePulse: '',
    openBeforePulseMobile: '#tour-openSlideoutButton',
    elementToPulseMobile: '#tour-openMessageButtonMobile'
  },
  {
    id: 'makeCall',
    title: 'Make a call',
    text: "Your TextUp phone number is what displays on clients' caller ID.",
    elementToPulse: '#tour-openCallButton',
    openBeforePulse: '',
    openBeforePulseMobile: '#tour-openSlideoutButton',
    elementToPulseMobile: '#tour-openCallButtonMobile'
  },
  {
    id: 'setAvailability',
    title: 'Set your availability',
    text: "Determine when you want notifications of work calls and texts-- and when you don't.",
    elementToPulse: '#tour-openAvailabilityButton',
    openBeforePulse: '',
    openBeforePulseMobile: '#tour-openSlideoutButton',
    elementToPulseMobile: '#tour-openAvailabilityButtonMobile'
  },
  {
    id: 'createTag',
    title: 'Create a tag',
    text: 'Send the same message to many clients at once.',
    elementToPulse: '#tour-createNewTagButton',
    openBeforePulse: '#tour-openTagsListButton',
    openBeforePulseMobile: '#tour-openSlideoutButton',
    elementToPulseMobile: '#tour-createNewTagButtonMobile'
  },
  {
    id: 'exportMessage',
    title: 'Export message records',
    text: 'Supplement records with case notes by clicking the + button.',
    elementToPulse: '#tour-openExportButton',
    openBeforePulse: '',
    openBeforePulseMobile: '#tour-openSlideoutButton',
    elementToPulseMobile: '#tour-openExportButtonMobile'
  }
];
