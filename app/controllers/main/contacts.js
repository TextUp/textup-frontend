import Ember from 'ember';
import * as TextUtils from 'textup-frontend/utils/text';

const { computed } = Ember;

export default Ember.Controller.extend({
  tutorialService: Ember.inject.service(),

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
    if (newTag && newTag.get('constructor.modelName') === this.get('constants.MODEL.TAG')) {
      this.set('tag', newTag);
    } else {
      this.set('tag', null);
    }
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
          offset: phone.get('contacts.length')
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
  }
});
