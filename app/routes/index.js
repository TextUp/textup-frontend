import Ember from 'ember';

export default Ember.Route.extend({
	redirect: function(model, transition) {
		this._super(...arguments);
		this.transitionTo('login');
	},
});
