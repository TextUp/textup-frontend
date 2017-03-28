import Ember from 'ember';
import callIfPresent from '../../../utils/call-if-present';
import RecordNote from '../../../mixins/record-note-route';

export default Ember.Route.extend(RecordNote, {
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
				.then(() => {
					this.controller.get('tag')
						.findDuplicateFutureMessages()
						.then((dups) => dups.forEach((dup) => this.store.unloadRecord(dup)))
						.finally(() => callIfPresent(then));
				});
		}
	}
});