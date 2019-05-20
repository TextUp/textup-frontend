import Route from '@ember/routing/route';

export default Route.extend({
  queryParams: { filter: { refreshModel: true } },

  _changedFilter: false,

  setupController(controller, model) {
    this._super(...arguments);
    controller.setup(model);
  },

  actions: {
    didTransition() {
      this._super(...arguments);
      if (this.get('_changedFilter')) {
        this.get('controller').setup(this.get('currentModel'));
      }
      this.set('_changedFilter', false);
      return true; // propagate to close slideout handler
    },
    showFilteredContacts(filter) {
      this.set('_changedFilter', true);
      this.get('controller.phone').set('contactsFilter', filter);
      this.transitionTo('main.contacts', { queryParams: { filter } });
    },
  },
});
