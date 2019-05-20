import Route from '@ember/routing/route';

export default Route.extend({
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
