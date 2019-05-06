export function initialize(appInstance) {
  appInstance.lookup('service:renewTokenService').startWatchingAjaxRequests();
}

export default {
  name: 'ajax-prefilter-renew-token',
  initialize,
};
