import Ember from 'ember';
import config from '../../config/environment';

const { alias } = Ember.computed;

export default Ember.Controller.extend({
  signupController: Ember.inject.controller('signup'),

  selected: alias('signupController.selected'),
  orgs: alias('signupController.model'),

  actions: {
    select: function(org) {
      return new Ember.RSVP.Promise(resolve => {
        this.set('selected', org);
        resolve();
      });
    },
    deselect: function() {
      this.set('selected', null);
    },
    search: function(val) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        Ember.$
          .ajax({
            type: 'GET',
            url: `${config.host}/v1/public/organizations?search=${val}`
          })
          .then(data => {
            const orgs = data.organizations,
              doPushOrg = org => this.store.push(this.store.normalize('organization', org)),
              models = orgs ? orgs.map(doPushOrg) : [];
            resolve(models);
          }, this.get('dataService').buildErrorHandler(reject));
      });
    }
  }
});
