import Helper from '@ember/component/helper';
import { getOwner } from '@ember/application';
import { typeOf, isPresent } from '@ember/utils';
import { get, set } from '@ember/object';

export function getServicePropertySetter([serviceName, propName], { value = '' }) {
  const service = getOwner(this).lookup(`service:${serviceName}`);
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
export default Helper.extend({ compute: getServicePropertySetter });
