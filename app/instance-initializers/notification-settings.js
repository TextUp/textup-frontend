export function initialize(appInstance) {
  const service = appInstance.lookup('notification-messages:service');
  service.setDefaultClearNotification(5000);
  service.setDefaultAutoClear(true);
}

export default {
  name: 'notification-settings',
  initialize,
};
