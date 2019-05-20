import Route from '@ember/routing/route';

export default Route.extend({
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
