export default [
  {
    title: 'Welcome to TextUp!',
    text:
      "Let's show you around! We've prepared an interface tour to show you where things are in our app.",
    elementToHighlight: '',
    elementToHighlightMobile: '',
    elementToOpenMobile: '',
    stepNumber: 0
  },
  {
    title: 'Toolbar',
    text:
      "In the left-hand toolbar, you'll find the key actions for your TextUp account. Send a message, create a tag, make a phone call, and more.",
    elementToHighlight: '#menu',
    elementToHighlightMobile: '#menu',
    elementToOpenMobile: '',
    stepNumber: 1
  },
  {
    title: 'Contacts',
    text:
      "Once you have contacts, they'll appear here. Contacts with unread messages will be on the top, highlighted in blue. By selecting a contact, you can read the messages they sent you, send them messages, and more.",
    elementToHighlight: '.content',
    elementToHighlightMobile: '#tour-mobileContactsButton',
    elementToOpenMobile: '',
    stepNumber: 2
  },
  {
    title: 'Support',
    text:
      'Click here if you need help. You can search help articles, contact customer support, and even suggest new TextUp features.',
    elementToHighlight: '#tour-supportButton',
    elementToHighlightMobile: '#tour-supportButton',
    elementToOpenMobile: '',
    stepNumber: 3
  },
  {
    title: 'Settings',
    text:
      "Click this icon to edit your settings. If you have multiple TextUp phone numbers, this icon is where you'll go to switch between phones. If you have an administrator permissions, this is also where you can switch to the admin dashboard.",
    elementToHighlight: '.menu-item.menu-header',
    elementToHighlightMobile: '#tour-mobileSettings',
    stepNumber: 4
  },
  {
    title: "Let's Get Started",
    text:
      "Now that you know the basics of where things are in TextUp, let's show you how to use the app. The rest of the tour is optional, but it will only take a few minutes and we strongly suggest completing it. If you'd rather complete the tour later, it can always be relaunched from the Support button.",
    elementToHighlight: '#task-manager__container',
    elementToHighlightMobile: '#task-manager__container',
    elementToOpenMobile: '#tour-openSlideoutButton',
    stepNumber: 5
  }
];
