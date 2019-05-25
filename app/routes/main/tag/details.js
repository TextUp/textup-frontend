import Route from '@ember/routing/route';

export default Route.extend({
  // TODO do we still need this note?
  // For routes with dynamic segments, each time the model hook is called, the `setupController`
  // hook will also be called. We DO NOT want to set `careRecordRef` and `careRecordText` to null
  // because this will lead us to lose our reference to `careRecordRef`

  setupController(controller, model) {
    this._super(...arguments);
    controller.setupNewRecordText(model);
  },
  resetController(controller, isExiting) {
    this._super(...arguments);
    controller.resetState();
    if (!isExiting) {
      controller.setupNewRecordText();
    }
  },
});
