export function initialize(appInstance) {
  appInstance.lookup('service:socketDataService').startWatchingAuthChanges();
}

export default {
  name: 'socket-data',
  initialize,
};
