import Ember from 'ember';

export default Ember.Mixin.create({

	remaining: 'none', // top | right | bottom | left
	maxlength: null,

	indicatorClass: 'remaining-indicator',
	containerClass: '',

	// Computed properties
	// -------------------

	showRemaining: Ember.computed(function() {
		const position = this.get('remaining'),
			allowed = ['top', 'bottom', 'right', 'left'],
			maxlength = this.get('maxlength');
		return allowed.any((p) => position === p) && Ember.isPresent(maxlength);
	}),

	// Internal properties
	// -------------------

	$indicator: null,

	// Events
	// ------

	didInsertElement: function() {
		this._super(...arguments);
		if (!this.get('showRemaining')) {
			return;
		}
		const $el = this.$(),
			$indicator = this.build$Indicator(),
			$container = this.build$Container(),
			doUpdate = this.updateIndicator.bind(this, $el, $indicator),
			doUpdateAfter = function() {
				Ember.run.scheduleOnce('afterRender', this, doUpdate);
			};
		// for cleanup during destruction
		this.set('$indicator', $indicator);
		// insert items into the DOM
		$el.before($container);
		$container.append($el, $indicator);
		// bind events to the control
		$el
			.on(`keyup.${this.elementId}`, doUpdate)
			.on(`paste.${this.elementId}`, doUpdateAfter)
			.on(`cut.${this.elementId}`, doUpdateAfter)
			.on(`focusin.${this.elementId}`, function() {
				$indicator.fadeIn();
			})
			.on(`focusout.${this.elementId}`, function() {
				$indicator.fadeOut();
			});
		// after render, update indicator and hide it
		Ember.run.scheduleOnce('afterRender', this, function() {
			doUpdate();
			$indicator.hide();
		}.bind(this));
	},
	willDestroyElement: function() {
		this._super(...arguments);
		const $el = this.$(),
			$indicator = this.get('$indicator');
		$el.off(`.${this.elementId}`);
		// if indicator is present then we need to clean up
		if ($indicator && $indicator.length) {
			$indicator.remove();
			$el.unwrap();
		}
	},

	// DOM construction
	// ----------------

	build$Indicator: function() {
		const elId = this.elementId,
			indicatorClass = this.get('indicatorClass'),
			position = this.get('remaining');
		return Ember.$(`<div id="${elId}--indicator"
				class="${indicatorClass} ${position}"></div>`);
	},
	build$Container: function() {
		const containerClass = this.get('containerClass');
		return Ember.$(`<div class="${containerClass} remaining-container"></div>`);
	},

	// Indicator methods
	// -----------------

	updateIndicator: function($el, $indicator) {
		const numChars = $el.val().length,
			max = this.get('maxlength');
		$indicator.text(this.formatIndicatorLabel(numChars, max));
	},
	formatIndicatorLabel: function(numChars, max) {
		return `${numChars} / ${max}`;
	},
});