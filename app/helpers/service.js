import Helper from '@ember/component/helper';
import { getOwner } from '@ember/application';
import { isPresent } from '@ember/utils';

export function getService([serviceName]) {
  const service = getOwner(this).lookup(`service:${serviceName}`);
  if (!isPresent(service)) {
    throw new Error(`Service with name '${serviceName}' could not be found`);
  }
  return service;
}

export default Helper.extend({ compute: getService });
