import { typeOf } from '@ember/utils';

// TODO remove

export default function callIfPresent(context, onCall, args) {
  return typeOf(onCall) === 'function' ? onCall.apply(context, args) : null;
}
