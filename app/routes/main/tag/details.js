import Ember from 'ember';
import callIfPresent from '../../../utils/call-if-present';
import RecordNote from '../../../mixins/record-note-route';

export default Ember.Route.extend(RecordNote, {
  setupController: function(controller) {
    this._super(...arguments);
    controller.set('tag', this.controllerFor('main.tag').get('tag'));
    controller.set('contact', null);
  },

  actions: {
    initializeFutureMsg: function() {
      this.controller.set(
        'newFutureMsg',
        this.store.createRecord('future-message', {
          language: this.controller.get('tag.language')
        })
      );
    },
    createFutureMsg: function(fMsg, then) {
      fMsg.set('tagId', this.controller.get('tag.id'));
      return this.get('dataHandler')
        .persist(fMsg)
        .then(() => {
          callIfPresent(then);
          // reload the current model (tag) to reload the future messages to ensure that
          // they are in the correct state (such as for language)
          Ember.run.later(() => {
            this.controller.get('tag').reload();
          }, 2000);
        });
    }
  }
});
