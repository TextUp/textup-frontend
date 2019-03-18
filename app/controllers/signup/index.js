import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { alias } = Ember.computed;

export default Ember.Controller.extend({
  signupController: Ember.inject.controller('signup'),

  selected: alias('signupController.selected'),
  orgs: alias('signupController.model'),

  actions: {
    select(org) {
      return new Ember.RSVP.Promise(resolve => {
        this.set('selected', org);
        resolve();
      });
    },
    deselect() {
      this.set('selected', null);
    },
    search(val) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        Ember.$.ajax({
          type: Constants.REQUEST_METHOD.GET,
          url: `${config.host}/v1/public/organizations?search=${val}`,
        }).then(data => {
          const orgs = data.organizations,
            doPushOrg = org => this.store.push(this.store.normalize('organization', org)),
            models = orgs ? orgs.map(doPushOrg) : [];
          resolve(models);
        }, this.get('dataService').buildErrorHandler(reject));
      });
    },
  },
});
