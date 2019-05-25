import Route from '@ember/routing/route';

export default Route.extend({
  redirect() {
    this._super(...arguments);
    this.controller.exitManyIfNoSelected();
  },
  resetController(controller, isExiting) {
    this._super(...arguments);
    if (isExiting) {
      controller.deselectAllContacts();
    }
  },
});
