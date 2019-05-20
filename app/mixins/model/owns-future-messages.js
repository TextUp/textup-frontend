import { alias, readOnly, uniqBy, sort } from '@ember/object/computed';
import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { typeOf } from '@ember/utils';
import DS from 'ember-data';

// NOTE: promise array proxies property calls onto underlying array, and will
// return zero until fulfilled, when it returns the true length

export default Mixin.create({
  // Properties
  // ----------

  numFutureMessages: alias('_sortedFutureMessages.length'),
  futureMessages: readOnly('_sortedFutureMessages'),
  nextFutureFire: readOnly('_nextFutureFire'),

  // Private properties
  // ------------------

  _futureMessages: DS.hasMany('future-message'),
  _uniqueFutureMessages: uniqBy('_futureMessages', 'id'),
  _futureMessagesSorting: ['nextFireDate:asc'],
  _sortedFutureMessages: sort('_uniqueFutureMessages', '_futureMessagesSorting'),

  _nextFutureFire: computed(
    '_sortedFutureMessages.@each.nextFireDate',
    '_sortedFutureMessages.@each.isDone',
    function() {
      const fMsgs = this.get('_sortedFutureMessages'),
        currentTime = new Date().getTime();
      let nextFire;
      fMsgs.forEach(fMsg => {
        if (!fMsg.get('isDone')) {
          const thisTime = fMsg.get('nextFireDate');
          if (thisTime && thisTime.getTime() > currentTime) {
            nextFire = !nextFire || thisTime.getTime() < nextFire.getTime() ? thisTime : nextFire;
          }
        }
      });
      return nextFire;
    }
  ),

  // Methods
  // -------

  addFutureMessages(fMsgs) {
    if (typeOf(fMsgs) !== 'array') {
      return false;
    }
    let isAllSuccess = true;
    fMsgs.forEach(fMsg => (isAllSuccess = isAllSuccess && this.addFutureMessage(fMsg)));
    return isAllSuccess;
  },

  addFutureMessage(fMsg) {
    if (!fMsg) {
      return false;
    }
    this.get('_futureMessages').pushObject(fMsg);
    return true;
  },
});
