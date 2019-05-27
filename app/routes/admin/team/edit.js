import Route from '@ember/routing/route';

// TODO check to see if this still happens:
// newly-created teams will lose their location reference, so we will re-fetch the team
// if this has happened

export default Route.extend({
  resetController(controller, isExiting) {
    this._super(...arguments);
    if (isExiting) {
      AppUtils.tryRollback(controller.get('model'));
    }
  },
});
