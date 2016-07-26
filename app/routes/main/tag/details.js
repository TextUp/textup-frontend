import Ember from 'ember';
import callIfPresent from '../../../utils/call-if-present';

export default Ember.Route.extend({
	setupController: function(controller) {
		this._super(...arguments);
		controller.set('tag', this.controllerFor('main.tag').get('tag'));
		controller.set('contact', null);
	},

	actions: {
		initializeFutureMsg: function() {
			this.controller.set('newFutureMsg', this.store.createRecord('future-message'));
		},
		createFutureMsg: function(fMsg, then) {
			fMsg.set('tagId', this.controller.get('tag.id'));
			return this.get('dataHandler')
				.persist(fMsg)
				.then(() => callIfPresent(then));
		}
	}
});
