// [TODO] remove once we are sure about the behavior of the `service-mut` and `service-prop` helpers

export function initialize(application) {
  application.inject('controller', 'authService', 'service:authService');
  application.inject('controller', 'dataService', 'service:dataService');
  application.inject('controller', 'stateService', 'service:stateService');
}

export default {
  name: 'controller-injections',
  initialize,
};
