export function initialize(appInstance) {
  appInstance.lookup('service:pageVisibilityService').startWatchingVisibilityChanges();
  appInstance.lookup('service:renewTokenService').startWatchingAjaxRequests();
  appInstance.lookup('service:socketDataService').startWatchingAuthChanges();
  appInstance.lookup('service:storageService').startWatchingStorageUpdates();
  appInstance.lookup('service:tutorialService').setUpTutorial();
  appInstance.lookup('service:webAppCacheService').trySetUpAndWatchUpdateEvents();
}

export default {
  name: 'init-services',
  initialize,
};
