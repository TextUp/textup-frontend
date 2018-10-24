import Ember from 'ember';
import moment from 'moment';

const { typeOf } = Ember;

export function formatSecondsAsTimeElapsed(numSeconds) {
  const seconds = parseInt(numSeconds);
  if (isNaN(seconds) || typeOf(seconds) !== 'number' || seconds < 0) {
    return '';
  }
  const duration = moment.duration(seconds, 'seconds'),
    formatted = [
      ensureTwoPlaces(duration.minutes() + ''),
      ensureTwoPlaces(duration.seconds() + '')
    ];

  if (duration.asHours() >= 1) {
    formatted.unshiftObject(ensureTwoPlaces(Math.floor(duration.asHours()) + ''));
  }
  return formatted.join(':');
}

function ensureTwoPlaces(numString) {
  if (typeOf(numString) !== 'string') {
    return numString;
  }
  switch (numString.length) {
    case 0:
      return '00';
    case 1:
      return '0' + numString;
    default:
      return numString;
  }
}
