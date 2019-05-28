import AppAccessUtils from 'textup-frontend/utils/app-access';
import Constants from 'textup-frontend/constants';
import HasSlideoutOutlet from 'textup-frontend/mixins/route/has-slideout-outlet';
import IsAuthenticated from 'textup-frontend/mixins/route/is-authenticated';
import PropertyUtils from 'textup-frontend/utils/property';
import RequiresSetup from 'textup-frontend/mixins/route/requires-setup';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend(HasSlideoutOutlet, IsAuthenticated, RequiresSetup, {
  authService: service(),
  notifications: service('notification-messages-service'),
  sharingService: service(),
  stateService: service(),

  slideoutOutlet: Constants.SLIDEOUT.OUTLET.DETAIL,

  beforeModel() {
    this._super(...arguments);
    // unload contacts that might duplicate between different phones because of sharing
    // [NOTE] this line must be BEFORE the model hook to avoid invalidating contacts
    // found in nested child routes
    this.get('store').unloadAll('contact');
  },
  serialize(model) {
    return { main_identifier: model.get(Constants.PROP_NAME.URL_IDENT) };
  },
  // `model` hook will not be called if the model object is already provided
  model(params) {
    this._super(...arguments);
    const authUser = this.get('authService.authUser'),
      foundModel = AppAccessUtils.tryFindPhoneOwnerOrSelfFromUrl(authUser, params.main_identifier);
    if (foundModel) {
      return foundModel;
    } else {
      this.get('notifications').info('Please log in to access this TextUp phone.');
      this.get('authService').logout();
    }
  },
  afterModel(model = null) {
    this._super(...arguments);
    if (AppAccessUtils.isActivePhoneOwner(model)) {
      this.get('stateService').set('owner', model);
    } else {
      AppAccessUtils.determineAppropriateLocation(this, this.get('authService.authUser'));
    }
  },
  setupController(controller, model) {
    this._super(...arguments);
    this.get('sharingService').loadStaffCandidatesForPhoneOwner(model);
  },
  resetController(controller) {
    this._super(...arguments);
    PropertyUtils.callIfPresent(controller.get('accountSwitcher.actions.close'));
    PropertyUtils.callIfPresent(controller.get('slidingMenu.actions.close'));
  },
  redirect(model, transition) {
    this._super(...arguments);
    if (transition.targetName === 'main.index') {
      this.transitionTo('main.contacts');
    }
  },
});
