import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AppAccessUtils from 'textup-frontend/utils/app-access';
import IsAuthenticated from 'textup-frontend/mixins/route/is-authenticated';
import RequiresSetup from 'textup-frontend/mixins/route/requires-setup';

export default Route.extend(IsAuthenticated, RequiresSetup, {
  authService: service(),
  stateService: service(),

  controllerName: 'main',

  beforeModel() {
    this._super(...arguments);
    AppAccessUtils.determineAppropriateLocation(this, this.get('authService.authUser'));
  },
  afterModel() {
    this.get('stateService').set('owner', null);
  },
});
