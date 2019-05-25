import $ from 'jquery';
import config from 'textup-frontend/config/environment';
import Constants from 'textup-frontend/constants';
import Controller, { inject as controller } from '@ember/controller';
import RSVP from 'rsvp';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Controller.extend({
  requestService: service(),
  signupController: controller('signup'),

  selected: alias('signupController.selected'),
  orgs: alias('signupController.model'),

  actions: {
    select(org) {
      return new RSVP.Promise(resolve => {
        this.set('selected', org);
        resolve();
      });
    },
    deselect() {
      this.set('selected', null);
    },
    search(val) {
      return new RSVP.Promise((resolve, reject) => {
        this.get('requestService')
          .handleIfError(
            $.ajax({
              type: Constants.REQUEST_METHOD.GET,
              url: `${config.host}/v1/public/organizations?search=${val}`,
            })
          )
          .then(data => {
            const orgs = data.organizations,
              doPushOrg = org =>
                this.get('store').push(this.get('store').normalize('organization', org)),
              models = orgs ? orgs.map(doPushOrg) : [];
            resolve(models);
          }, reject);
      });
    },
  },
});
