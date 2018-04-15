import DS from 'ember-data';
import Ember from 'ember';
import uniqBy from '../utils/uniq-by';

const { computed, computed: { sort } } = Ember;

export default Ember.Mixin.create({
  // Attributes
  // ----------

  futureMessages: DS.hasMany('future-message'),
  uniqueFutureMessages: uniqBy('futureMessages', 'id'),
  futureMessagesSorting: ['nextFireDate:asc'],
  sortedFutureMessages: sort('uniqueFutureMessages', 'futureMessagesSorting'),

  // Computed properties
  // -------------------

  hasFutureMsgs: computed('futureMessages.[]', function() {
    // promise array proxies property calls onto underlying array, and will
    // return zero until fulfilled, when it returns the true length
    return !!this.get('futureMessages.length');
  }),
  nextFutureFire: computed(
    'futureMessages.@each.nextFireDate',
    'futureMessages.@each.isDone',
    function() {
      return DS.PromiseObject.create({
        promise: this.get('futureMessages').then(fMsgs => {
          return fMsgs.reduce((prev, fMsg) => {
            if (fMsg.get('isDone')) {
              return prev;
            } else {
              const val = fMsg.get('nextFireDate');
              return !prev || val.getTime() < prev.getTime() ? val : prev;
            }
          }, null);
        })
      });
    }
  )
});
