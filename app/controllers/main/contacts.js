import Constants from 'textup-frontend/constants';
import TextUtils from 'textup-frontend/utils/text';
import TypeUtils from 'textup-frontend/utils/type';
import Ember from 'ember';

const { computed } = Ember;

export default Ember.Controller.extend({
  queryParams: ['filter'],
  filter: null,
  tag: null,
  contactsList: null,

  phone: computed.alias('stateManager.owner.phone.content'),
  filterName: computed('phone.contactsFilter', function() {
    return TextUtils.capitalize(this.get('phone.contactsFilter') || Constants.CONTACT.FILTER.ALL);
  }),

  setup(newTag = null) {
    const contactsList = this.get('contactsList'),
      phone = this.get('phone');
    if (contactsList) {
      contactsList.actions.resetAll();
    }
    phone.clearContacts();
    if (TypeUtils.isTag(newTag)) {
      this.set('tag', newTag);
      phone.set('contactsFilter', null);
    } else {
      this.set('tag', null);
      phone.set('contactsFilter', this.get('filter'));
    }
  },

  doRefreshContacts() {
    const phone = this.get('phone');
    phone.clearContacts();
    return this.doLoadMoreContacts();
  },

  doLoadMoreContacts() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const tag = this.get('tag'),
        phone = this.get('phone');
      // if we are in the middle of transitioning to admin, then we no longer have a phone on owner
      if (phone) {
        // teamId added by `contact` adapter
        this.get('dataService')
          .request(
            this.get('store').query('contact', {
              max: 20,
              status: phone.get('contactStatuses'),
              offset: phone.get('contacts.length'),
              tagId: tag ? tag.get('id') : null,
            })
          )
          .then(results => {
            phone.set('totalNumContacts', results.get('meta.total'));
            phone.addContacts(results.toArray());
            resolve();
          }, reject);
      } else {
        resolve();
      }
    });
  },
});
