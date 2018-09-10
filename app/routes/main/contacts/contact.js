import Ember from 'ember';
import ManagesCareRecord from 'textup-frontend/mixins/route/manages-care-record';
import ManagesContactAttributes from 'textup-frontend/mixins/route/manages-contact-attributes';
import ManagesExistingContact from 'textup-frontend/mixins/route/manages-existing-contact';
import ManagesFutureMessages from 'textup-frontend/mixins/route/manages-future-messages';
import ManagesRecordNotes from 'textup-frontend/mixins/route/manages-record-notes';
import ManagesTagMembership from 'textup-frontend/mixins/route/manages-tag-membership';

export default Ember.Route.extend(
  ManagesCareRecord,
  ManagesContactAttributes,
  ManagesExistingContact,
  ManagesFutureMessages,
  ManagesRecordNotes,
  ManagesTagMembership,
  {
    templateName: 'main/contacts/contact',
    backRouteName: 'main.contacts',

    model: function({ id }) {
      if (id) {
        const found = this.store.peekRecord('contact', id);
        return found
          ? found
          : this.store.findRecord('contact', id).catch(failure => Ember.RSVP.reject(failure));
      } else {
        this.transitionTo(this.get('backRouteName'));
      }
    },
    setupController(controller) {
      this._super(...arguments);
      controller.set('backRouteName', this.get('backRouteName'));
    }
  }
);
