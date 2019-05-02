export function initialize(appInstance) {
  const service = appInstance.lookup('service:notifications');
  service.setDefaultClearNotification(5000);
  service.setDefaultAutoClear(true);
}

export default {
  name: 'notification-settings',
  initialize,
};
