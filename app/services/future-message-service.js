import Ember from 'ember';

const { run, tryInvoke } = Ember;

export default Ember.Service.extend({
  dataService: Ember.inject.service(),
  store: Ember.inject.service(),

  createNew(owner) {
    const fMessage = this.get('store').createRecord('future-message', {
      language: owner.get('language')
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
        .then(() => run.later(() => this._tryReloadOwner(fMessage), 2000))
    );
  },

  // Internal methods
  // ----------------

  _tryReloadOwner(fMessage) {
    const owner = fMessage.get('owner.content');
    if (owner) {
      tryInvoke(owner, 'reload');
    }
  }
});
