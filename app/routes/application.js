import Ember from 'ember';
import Slideout from '../mixins/slideout-route';
import Loading from '../mixins/loading-slider';

export default Ember.Route.extend(Slideout, Loading, {
	init: function() {
		this._super(...arguments);
		this.notifications.setDefaultClearNotification(5000);
		this.notifications.setDefaultAutoClear(true);
	},
	actions: {
		didTransition: function() {
			this._closeSlideout();
		},
		toggleSlideout: function(name, context) {
			this._toggleSlideout(name, context);
		},
		openSlideout: function(name, context) {
			this._openSlideout(name, context);
		},
		closeSlideout: function() {
			this._closeSlideout();
		},
	}
});
