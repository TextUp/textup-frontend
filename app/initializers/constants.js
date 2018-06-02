export function initialize(application) {
  application.inject('route', 'constants', 'service:constants');
  application.inject('controller', 'constants', 'service:constants');
  application.inject('model', 'constants', 'service:constants');
}

export default {
  name: 'constants',
  initialize
};
