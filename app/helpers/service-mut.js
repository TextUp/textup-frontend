import Ember from 'ember';

const { isPresent, typeOf, set, get } = Ember;

export function getServicePropertySetter([serviceName, propName], { value = '' }) {
  const service = Ember.getOwner(this).lookup(`service:${serviceName}`);
  if (!isPresent(service)) {
    throw new Error(`Service with name '${serviceName}' could not be found`);
  }
  if (typeOf(propName) !== 'string') {
    throw new Error(`Property name '${propName}' must evaluate to a string`);
  }
  if (typeOf(value) !== 'string') {
    throw new Error(`Value property to extract name '${value}' must evaluate to a string`);
  }
  return function(newVal) {
    return set(service, propName, newVal && value ? get(newVal, value) : newVal);
  };
}

// need to make a helper object to allow injection
export default Ember.Helper.extend({ compute: getServicePropertySetter });
