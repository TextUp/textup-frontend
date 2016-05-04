import Ember from 'ember';
import Public from '../mixins/public-route';

export default Ember.Route.extend(Public, {
	redirect: function() {
		this._super(...arguments);
		this.transitionTo('login');
	},
});
