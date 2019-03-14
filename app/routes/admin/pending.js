import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    changeFilter(filter) {
      this.transitionTo('admin.people', {
        queryParams: {
          filter: filter,
        },
      });
    },
  },
});
