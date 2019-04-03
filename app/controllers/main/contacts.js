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
    return TextUtils.capitalize(this.get('phone.contactsFilter'));
  }),

  setup(newTag = null) {
    const contactsList = this.get('contactsList');
    if (contactsList) {
      contactsList.actions.resetAll();
    }
    this.set('tag', TypeUtils.isTag(newTag) ? newTag : null);
    this.get('phone').clearContacts();
  },

  doRefreshContacts() {
    const phone = this.get('phone');
    phone.clearContacts();
    return this.doLoadMoreContacts();
  },

  doLoadMoreContacts() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const team = this.get('stateManager.ownerAsTeam'),
        tag = this.get('tag'),
        phone = this.get('phone');
      // if we are in the middle of transitioning to admin, then we no longer have a phone on owner
      if (phone) {
        this.get('dataService')
          .request(
            this.get('store').query('contact', {
              max: 20,
              status: phone.get('contactStatuses'),
              offset: phone.get('contacts.length'),
              tagId: tag ? tag.get('id') : null,
              teamId: team ? team.get('id') : null,
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
