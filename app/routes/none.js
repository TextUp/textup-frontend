import * as AppAccessUtils from 'textup-frontend/utils/app-access';
import Ember from 'ember';
import IsAuthenticated from 'textup-frontend/mixins/route/is-authenticated';
import RequiresSetup from 'textup-frontend/mixins/route/requires-setup';

export default Ember.Route.extend(IsAuthenticated, RequiresSetup, {
  controllerName: 'main',

  beforeModel() {
    this._super(...arguments);
    AppAccessUtils.determineAppropriatePosition(this, this.get('authService'));
  },
  afterModel() {
    this.get('stateManager').set('owner', null);
  },
});
