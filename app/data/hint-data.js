import Constants from 'textup-frontend/constants';

export default {
  [Constants.HINT.CONTACT_ADD]: {
    title: '',
    message: 'The number for our Customer Support Hotline is (401) 519-7932',
  },
  [Constants.HINT.CONTACT_LANGUAGE]: {
    title: '',
    message: 'This is the language that robo calls sent to this contact will default to.',
  },
  [Constants.HINT.CONTACT_NUMBERS]: {
    title: '',
    message:
      'You can add multiple phone numbers for the same contact and rank them in order of priority. We’ll send your call or text to the first priority number. If that number is no longer in service, we’ll route the communication to the second priority number and so on.',
  },
  [Constants.HINT.COMPOSE]: {
    title: '',
    message: 'You can send a message to one or multiple contacts.',
  },
  [Constants.HINT.AVAILABILITY]: {
    title: '',
    message:
      'When you’re listed as available, you’ll be notified of incoming calls and texts. When you’re listed as not available, calls will be directed to voicemail and texts will be automatically responded to with your away message.',
  },
  [Constants.HINT.TAG_LANGUAGE]: {
    title: '',
    message: 'This is the language that robocalls sent to this tag will default to.',
  },
  [Constants.HINT.TAG_COLOR]: {
    title: '',
    message: 'The color of a tag is solely for your organizational purposes.',
  },
};
