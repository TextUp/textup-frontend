import { helper as buildHelper } from '@ember/component/helper';

// TODO test

export function array(params) {
  return [...params];
}

export default buildHelper(array);
