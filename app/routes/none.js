import AppAccessUtils from 'textup-frontend/utils/app-access';
import Ember from 'ember';
import IsAuthenticated from 'textup-frontend/mixins/route/is-authenticated';
import RequiresSetup from 'textup-frontend/mixins/route/requires-setup';

export default Ember.Route.extend(IsAuthenticated, RequiresSetup, {
  authService: Ember.inject.service(),
  stateService: Ember.inject.service(),

  controllerName: 'main',

  beforeModel() {
    this._super(...arguments);
    AppAccessUtils.determineAppropriateLocation(this, this.get('authService.authUser'));
  },
  afterModel() {
    this.get('stateService').set('owner', null);
  },
});
