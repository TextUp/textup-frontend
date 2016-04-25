import Ember from 'ember';

export default Ember.Route.extend({
	deactivate: function() {
		this._super(...arguments);
		this.controller.send('selectNone');
	},
});
