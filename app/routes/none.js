import Ember from 'ember';
import IsAuthenticated from 'textup-frontend/mixins/route/is-authenticated';
import RequiresSetup from 'textup-frontend/mixins/route/requires-setup';

export default Ember.Route.extend(IsAuthenticated, RequiresSetup, {
  controllerName: 'main',

  beforeModel: function() {
    this._super(...arguments);
    const user = this.get('authService.authUser');
    return user.get('isNone').then(isNone => {
      const orgIsApproved = user.get('org.content.isApproved');
      if (orgIsApproved) {
        if (!isNone) {
          this.transitionTo('main', user);
        } else if (user.get('isAdmin')) {
          this.transitionTo('admin');
        }
      }
    });
  },
  afterModel: function() {
    this.get('stateManager').set('owner', null);
  }
});
