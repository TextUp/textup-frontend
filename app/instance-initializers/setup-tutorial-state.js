export function initialize(appInstance) {
  appInstance.lookup('service:tutorialService').setUpTutorial();
}

export default {
  name: 'setup-tutorial-state',
  initialize,
};
