import * as TextUtils from 'textup-frontend/utils/text';
import * as TypeUtils from 'textup-frontend/utils/type';
import Ember from 'ember';

const { computed } = Ember;

export default Ember.Controller.extend({
  queryParams: ['filter'],
  filter: null,
  tag: null,
  contactsList: null,

  phone: computed.alias('stateManager.owner.phone.content'),
  filterName: computed('phone.contactsFilter', function() {
    return TextUtils.capitalize(this.get('phone.contactsFilter'));
  }),

  setup(newTag = null) {
    const contactsList = this.get('contactsList');
    if (contactsList) {
      contactsList.actions.resetPosition();
    }
    this.set('tag', TypeUtils.isTag(newTag) ? newTag : null);
    this.get('phone').clearContacts();
  },

  doRefreshContacts() {
    const phone = this.get('phone');
    phone.clearContacts();
    this.doLoadMoreContacts();
  },

  doLoadMoreContacts() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const team = this.get('stateManager.ownerAsTeam'),
        tag = this.get('tag'),
        phone = this.get('phone');
      // if we are in the middle of transitioning to admin, then we no longer have a phone on owner
      if (phone) {
        const query = {
          max: 20,
          status: phone.get('contactStatuses'),
          offset: phone.get('contacts.length'),
        };
        // right now only supports passing one id to the backend at a time.
        // NOT both tag and team
        if (tag) {
          query.tagId = tag.get('id');
          delete query.status; // ignore filter if viewing a tag
        } else if (team) {
          query.teamId = team.get('id');
        }
        this.get('store')
          .query('contact', query)
          .then(results => {
            phone.set('totalNumContacts', results.get('meta.total'));
            phone.addContacts(results.toArray());
            resolve();
          }, this.get('dataService').buildErrorHandler(reject));
      } else {
        resolve();
      }
    });
  },
});
