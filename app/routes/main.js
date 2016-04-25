import Ember from 'ember';
import Slideout from '../mixins/slideout-route';

export default Ember.Route.extend(Slideout, {
	slideoutOutlet: 'details-slideout',
	actions: {
		updateStaff: function() {
			console.log('updateStaff');
			return false;
		},
		didTransition: function() {
			this._closeSlideout();
			return true
		},
		toggleDetailSlideout: function(name, context) {
			this._toggleSlideout(name, context);
		},
		openDetailSlideout: function(name, context) {
			this._openSlideout(name, context);
		},
		closeSlideout: function() {
			this._closeSlideout();
			return true;
		},
	}
});
