export default [
  {
    title: 'Welcome to TextUp!',
    text: "If this is your first time, let's show you around!",
    elementToHighlight: '',
    elementToHighlightMobile: '',
    elementToOpenMobile: '',
  },
  {
    title: 'Toolbar',
    text:
      "In the left-hand toolbar, you'll find the key actions for your TextUp account. Send a message, create a tag, make a phone call, and more.",
    elementToHighlight: '#menu',
    elementToHighlightMobile: '#menu',
    elementToOpenMobile: '#tour-openSlideoutButton',
  },
  {
    title: 'Contacts',
    text:
      "Once you have contacts, they'll appear here. Contacts with unread messages will be on the top, highlighted in blue.",
    elementToHighlight: '.content',
    elementToHighlightMobile: '#tour-mobileContacts',
    elementToOpenMobile: '#tour-openSlideoutButton',
  },
  {
    title: 'Support',
    text:
      'Click here if you need help. You can search help articles, contact customer support, and even suggest new TextUp features.',
    elementToHighlight: '#tour-supportButton',
    elementToHighlightMobile: '#tour-supportButton',
    elementToOpenMobile: '#tour-openSlideoutButton',
  },
  {
    title: 'Settings',
    text:
      "Click this icon to edit your settings. If you have multiple TextUp phone numbers, this icon is where you'll go to switch between phones. If you have an administrator permissions, this is also where you can switch to the admin dashboard.",
    elementToHighlight: '.menu-item.menu-header',
    elementToHighlightMobile: '#tour-mobileSettings',
    elementToOpenMobile: '',
  },
  {
    title: "It's your turn",
    text:
      "Now that you know the basics of TextUp, it's your turn. Start learning how to use TextUp by following these interactive steps.",
    elementToHighlight: '#task-manager__container',
    elementToHighlightMobile: '#task-manager__container',
    elementToOpenMobile: '#tour-openSlideoutButton',
  },
];
