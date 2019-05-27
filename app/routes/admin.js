import AppAccessUtils from 'textup-frontend/utils/app-access';
import Constants from 'textup-frontend/constants';
import HasSlideoutOutlet from 'textup-frontend/mixins/route/has-slideout-outlet';
import IsAuthenticated from 'textup-frontend/mixins/route/is-authenticated';
import RequiresSetup from 'textup-frontend/mixins/route/requires-setup';
import Route from '@ember/routing/route';
import RSVP, { all } from 'rsvp';
import { copy } from '@ember/object/internals';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { isArray } from '@ember/array';
import { later } from '@ember/runloop';

export default Route.extend(HasSlideoutOutlet, IsAuthenticated, RequiresSetup, {
  adminService: service(),
  authService: service(),
  dataService: service(),
  requestService: service(),
  stateService: service(),

  slideoutOutlet: Constants.SLIDEOUT.OUTLET.DETAIL,

  beforeModel() {
    this._super(...arguments);
    const authUser = this.get('authService.authUser');
    if (!AppAccessUtils.canStaffAccessAdminDashboard(authUser)) {
      AppAccessUtils.determineAppropriateLocation(this, authUser);
    }
  },
  model() {
    this._super(...arguments);
    return this.get('authService.authUser.org');
  },
  afterModel(org) {
    this._super(...arguments);
    this.get('stateService').set('owner', org);
  },
  setupController(controller, org) {
    this._super(...arguments);
    this.get('adminService')
      .loadPendingStaff(org.get('id'))
      .then(({ pending, numPending }) => controller.setProperties({ pending, numPending }));
  },
  redirect(model, transition) {
    this._super(...arguments);
    if (transition.targetName === 'admin.index') {
      this.transitionTo('admin.people');
    }
  },
});
