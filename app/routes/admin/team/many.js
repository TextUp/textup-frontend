import Ember from 'ember';

export default Ember.Route.extend({
  controllerName: 'admin/people/many',
  templateName: 'admin/people/many',

  actions: {
    willTransition: function() {
      this._super(...arguments);
      this.controller._deselectAll();
      return true;
    },
    didTransition: function() {
      this._super(...arguments);
      if (this.controller.get('selected').length === 0) {
        this.transitionTo('admin.team');
      }
      return true; // for closing slideouts
    }
  }
});
