export function initialize(application) {
  application.inject('route', 'dataService', 'service:data-service');
  application.inject('controller', 'dataService', 'service:data-service');
}

export default {
  name: 'data-service',
  initialize
};
