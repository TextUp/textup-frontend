import $ from 'jquery';
import { Promise } from 'rsvp';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import { alias } from '@ember/object/computed';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';

export default Controller.extend({
  requestService: service(),
  signupController: controller('signup'),

  selected: alias('signupController.selected'),
  orgs: alias('signupController.model'),

  actions: {
    select(org) {
      return new Promise(resolve => {
        this.set('selected', org);
        resolve();
      });
    },
    deselect() {
      this.set('selected', null);
    },
    search(val) {
      return new Promise((resolve, reject) => {
        this.get('requestService')
          .handleIfError(
            $.ajax({
              type: Constants.REQUEST_METHOD.GET,
              url: `${config.host}/v1/public/organizations?search=${val}`,
            })
          )
          .then(data => {
            const orgs = data.organizations,
              doPushOrg = org => this.store.push(this.store.normalize('organization', org)),
              models = orgs ? orgs.map(doPushOrg) : [];
            resolve(models);
          }, reject);
      });
    },
  },
});
