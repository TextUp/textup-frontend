import { addObserver, removeObserver } from '@ember/object/observers';
import { getOwner } from '@ember/application';
import Helper from '@ember/component/helper';
import { typeOf, isPresent } from '@ember/utils';
import { computed, get } from '@ember/object';

export default Helper.extend({
  willDestroy() {
    this._super(...arguments);
    this._tryStopObserving();
  },

  compute([serviceName, passedInPropName]) {
    const service = this.get('_service') || getOwner(this).lookup(`service:${serviceName}`),
      propName = this.get('_propName') || passedInPropName;
    if (!this.get('_isSetUp')) {
      this._setUp(service, serviceName, propName);
    }
    const propVal = get(service, propName);
    if (typeOf(propVal) === 'function') {
      throw new Error(
        `Helper service-prop for service '${serviceName}' and propName '${propName}' should not return a function. If you want to return a function, use service-action instead for proper context.`
      );
    }
    return propVal;
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
      addObserver(service, propName + '.[]', this, this.recompute); // in case is an array
    }
  },
  _tryStopObserving() {
    const service = this.get('_service'),
      propName = this.get('_propName');
    if (service && propName) {
      removeObserver(service, propName + '.[]', this, this.recompute);
    }
  },
});
