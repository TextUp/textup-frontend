import DS from 'ember-data';
import Ember from 'ember';
import uniqBy from 'textup-frontend/utils/uniq-by';

const { computed, typeOf } = Ember;

// NOTE: promise array proxies property calls onto underlying array, and will
// return zero until fulfilled, when it returns the true length

export default Ember.Mixin.create({
  // Properties
  // ----------

  numFutureMessages: computed.alias('_sortedFutureMessages.length'),
  futureMessages: computed.readOnly('_sortedFutureMessages'),
  nextFutureFire: computed.readOnly('_nextFutureFire'),

  // Private properties
  // ------------------

  _futureMessages: DS.hasMany('future-message'),
  _uniqueFutureMessages: uniqBy('_futureMessages.content', 'id'),
  _futureMessagesSorting: ['nextFireDate:asc'],
  _sortedFutureMessages: computed.sort('_uniqueFutureMessages', '_futureMessagesSorting'),

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
