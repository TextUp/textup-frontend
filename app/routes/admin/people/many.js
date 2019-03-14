import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    willTransition() {
      this._super(...arguments);
      this.controller._deselectAll();
      return true;
    },
    didTransition() {
      this._super(...arguments);
      if (this.controller.get('selected').length === 0) {
        this.transitionTo('admin.people');
      }
      return true; // for closing slideouts
    },
  },
});
