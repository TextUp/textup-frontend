import Ember from 'ember';

export default Ember.Mixin.create({
	slideoutOutlet: 'slideout',
	currentSlideoutName: null,

	_toggleSlideout: function(name, context) {
		const currentName = this.get('currentSlideoutName');
		if (this.controller.get('showSlideout')) {
			this._closeSlideout();
		}
		if (name && context && currentName !== name) {
			this._openSlideout(name, context);
		}
	},
	_openSlideout: function(name, context) {
		if (name === this.get('currentSlideoutName')) {
			return;
		}
		this.set('currentSlideoutName', name);
		this.render(name, {
			into: this.routeName,
			outlet: this.get('slideoutOutlet'),
			controller: context
		});
		Ember.run.scheduleOnce('afterRender', this, function() {
			this.controller.set('showSlideout', true);
		});
	},
	_closeSlideout: function() {
		this.set('currentSlideoutName', null);
		this.controller.set('showSlideout', false);
	}
});
