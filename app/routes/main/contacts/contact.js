import Ember from 'ember';
import callIfPresent from '../../../utils/call-if-present';
import RecordNote from '../../../mixins/record-note-route';

export default Ember.Route.extend(RecordNote, {
  _id: null,

  model: function(params) {
    const id = params.id;
    if (id) {
      this.set('_id', id);
      const found = this.store.peekRecord('contact', id);
      return found
        ? found
        : this.store.findRecord('contact', id).catch(failure => {
            this.notifications.error(`You do not have permission to access
            contact ${id} or the contact could not be found.`);
            return Ember.RSVP.reject(failure);
          });
    } else {
      this.transitionTo('main.contacts');
    }
  },
  setupController: function(controller, model) {
    this._super(...arguments);
    controller.set('_isReady', false);
    // workaround because ember data invalidates (deletes) the model
    // when it is finalizing the transition when the page is refreshed
    if (model.get('isDeleted')) {
      Ember.run.later(this, this._reloadContact, controller, this.get('_id'), 1000);
    } else {
      this._contactIsReady(model);
    }
    controller.set('contact', model);
    controller.set('tag', null);
    controller.set('isMakingCall', false);
  },

  // Actions
  // -------

  actions: {
    didTransition: function() {
      const recordsList = this.controller.get('_recordsList');
      if (recordsList) {
        recordsList.actions.resetPosition();
      }
      return true;
    },

    // Future message
    // --------------

    initializeFutureMsg: function() {
      this.controller.set(
        'newFutureMsg',
        this.store.createRecord('future-message', {
          language: this.get('currentModel.language')
        })
      );
    },
    createFutureMsg: function(fMsg, then) {
      fMsg.set('contactId', this.get('currentModel.id'));
      return this.get('dataHandler')
        .persist(fMsg)
        .then(() => {
          callIfPresent(then);
          // reload the current model (contact) to reload the future messages to ensure that
          // they are in the correct state (such as for language)
          Ember.run.later(() => {
            this.get('currentModel').reload();
          }, 2000);
        });
    }
  },

  // Helper methods
  // --------------

  _reloadContact: function(controller, id) {
    const found = this.store.peekRecord('contact', id),
      setContact = function(contact) {
        controller.set('model', contact);
        controller.set('contact', contact);
        this._contactIsReady(contact);
      }.bind(this);
    if (found) {
      setContact(found);
    } else {
      this.store.find('contact', id).then(setContact);
    }
  },
  _contactIsReady: function(contact) {
    this.controller.set('_isReady', true);
    this.set('currentModel', contact);
    if (contact.get('isUnread')) {
      contact.markActive();
      this.get('dataHandler').persist(contact);
    }
  }
});
