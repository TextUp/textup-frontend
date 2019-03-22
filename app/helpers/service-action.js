import Ember from 'ember';

const { isPresent, typeOf, get } = Ember;

export function getServiceAction([serviceName, functionName, ...curriedArgs]) {
  const service = Ember.getOwner(this).lookup(`service:${serviceName}`);
  if (!isPresent(service)) {
    throw new Error(`Service with name '${serviceName}' could not be found`);
  }
  if (typeOf(get(service, functionName)) !== 'function') {
    throw new Error(`'${serviceName}' service does not have a function named '${functionName}'`);
  }
  return function() {
    return get(service, functionName).apply(service, [...curriedArgs, ...arguments]);
  };
}

// need to make a helper object to allow injection
export default Ember.Helper.extend({ compute: getServiceAction });
