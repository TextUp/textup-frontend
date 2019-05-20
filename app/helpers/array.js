import Ember from 'ember';

// TODO test

export function array(params) {
  return [...params];
}

export default Ember.Helper.helper(array);
