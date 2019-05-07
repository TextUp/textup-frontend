import Ember from 'ember';

// [NOTE] this helper is not compatible with the `v-get` helper. The `v-get` helper expects a
// stream and this helper does not return a stream

const { isPresent, typeOf, get, computed } = Ember;

export default Ember.Helper.extend({
  willDestroy() {
    this._super(...arguments);
    this._tryStopObserving();
  },

  compute([serviceName, passedInPropName]) {
    const service = this.get('_service') || Ember.getOwner(this).lookup(`service:${serviceName}`),
      propName = this.get('_propName') || passedInPropName;
    if (!this.get('_isSetUp')) {
      this._setUp(service, serviceName, propName);
    }
    return get(service, propName);
  },

  // Internal properties
  // -------------------

  _isSetUp: computed('_service', '_propName', function() {
    return isPresent(this.get('_service')) && isPresent(this.get('_propName'));
  }),
  _service: null,
  _propName: null,

  // Internal handlers
  // -----------------

  _setUp(service, serviceName, propName) {
    if (!isPresent(service)) {
      throw new Error(`Service with name '${serviceName}' could not be found`);
    }
    if (typeOf(propName) !== 'string') {
      throw new Error(`Property name '${propName}' must evaluate to a string`);
    }
    this.setProperties({ _service: service, _propName: propName });
    if (service && propName) {
      Ember.addObserver(service, propName + '.[]', this, this.recompute); // in case is an array
    }
  },
  _tryStopObserving() {
    const service = this.get('_service'),
      propName = this.get('_propName');
    if (service && propName) {
      Ember.removeObserver(service, propName + '.[]', this, this.recompute);
    }
  },
});
