import Ember from 'ember';

// TODO test

const { typeOf } = Ember;

export default function callIfPresent(context, onCall, args) {
  return typeOf(onCall) === 'function' ? onCall.apply(context, args) : null;
}
