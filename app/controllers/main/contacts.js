import Constants from 'textup-frontend/constants';
import Controller from '@ember/controller';
import RSVP from 'rsvp';
import TextUtils from 'textup-frontend/utils/text';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  requestService: service(),
  stateService: service(),

  queryParams: ['filter'],
  filter: null,

  contactsList: null,
  phone: alias('stateService.owner.phone.content'),
  filterName: computed('phone.contactsFilter', function() {
    return TextUtils.capitalize(this.get('phone.contactsFilter') || Constants.CONTACT.FILTER.ALL);
  }),

  actions: {
    doRefreshContacts() {
      this.get('phone').clearContacts();
      return this._doLoad();
    },
    doLoadMoreContacts() {
      return this._doLoad();
    },
    toggleSelected(contact) {
      if (contact) {
        this.transitionTo('main.contacts.many');
        contact.toggleProperty('isSelected');
      }
    },
  },

  resetState() {
    // reset scroll
    const contactsList = this.get('contactsList');
    if (contactsList) {
      contactsList.actions.resetAll();
    }
    // update controller properties
    const phone = this.get('phone');
    phone.clearContacts();
    phone.set('contactsFilter', this.get('filter'));
  },

  // Internal
  // --------

  _doLoad() {
    return new RSVP.Promise((resolve, reject) => {
      const phone = this.get('phone');
      // if we are in the middle of transitioning to admin, then we no longer have a phone on owner
      if (phone) {
        // teamId added by `contact` adapter
        this.get('requestService')
          .handleIfError(
            this.get('store').query(Constants.MODEL_NAME.CONTACT, this._buildLoadParams())
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
  _buildLoadParams() {
    const phone = this.get('phone');
    return {
      max: 20,
      status: phone.get('contactStatuses'),
      offset: phone.get('contacts.length'),
    };
  },
});
