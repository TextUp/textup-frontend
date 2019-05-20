import Route from '@ember/routing/route';

export default Route.extend({
  controllerName: 'admin/people/many',
  templateName: 'admin/people/many',

  actions: {
    willTransition() {
      this._super(...arguments);
      this.controller._deselectAll();
      return true;
    },
    didTransition() {
      this._super(...arguments);
      if (this.controller.get('selected').length === 0) {
        this.transitionTo('admin.team');
      }
      return true; // for closing slideouts
    },
  },
});
