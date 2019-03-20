import Ember from 'ember';

const { isPresent, typeOf } = Ember;

export default Ember.Helper.extend({
  compute([serviceName, functionName, ...curriedArgs]) {
    const service = Ember.getOwner(this).lookup(`service:${serviceName}`);
    if (!isPresent(service)) {
      throw new Error(`Service with name '${serviceName}' could not be found`);
    }
    if (typeOf(service[functionName]) !== 'function') {
      throw new Error(`'${serviceName}' service does not have a function named '${functionName}'`);
    }
    return function() {
      service[functionName].apply(service, [...curriedArgs, ...arguments]);
    };
  },
});
