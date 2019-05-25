import Service, { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import { tryInvoke } from '@ember/utils';

export default Service.extend({
  dataService: service(),
  store: service(),

  createNew(owner) {
    const fMessage = this.get('store').createRecord('future-message', {
      language: owner.get('language'),
    });
    fMessage.set('owner', owner);
    return fMessage;
  },
  persistNew(fMessage) {
    return (
      this.get('dataService')
        .persist(fMessage)
        // reload the current model to reload the future messages to ensure that
        // they are in the correct state (such as for language)
        .then(() => later(() => this._tryReloadOwner(fMessage), 2000))
    );
  },

  // Internal methods
  // ----------------

  _tryReloadOwner(fMessage) {
    const owner = fMessage.get('owner.content');
    if (owner) {
      tryInvoke(owner, 'reload');
    }
  },
});
