import Ember from 'ember';
import defaultIfAbsent from '../utils/default-if-absent';

export default Ember.Component.extend({

	closeOnBodyClick: defaultIfAbsent(true),
	closeOnContentsClick: defaultIfAbsent(false),
	allowCloseContentsSelector: defaultIfAbsent(''),
	ignoreCloseContentsSelector: defaultIfAbsent(''),

	classNames: "sliding-drawer",
	_bodyClass: 'sliding-drawer-body',
	_contentsClass: 'sliding-drawer-contents',

	// Computed properties
	// -------------------

	$body: Ember.computed(function() {
		return this.$().find(`.${this.get('_bodyClass')}`);
	}),
	$contents: Ember.computed(function() {
		return this.$().find(`.${this.get('_contentsClass')}`);
	}),
	publicAPI: Ember.computed(function() {
		return {
			isOpen: false,
			actions: {
				toggle: this._toggle.bind(this),
				open: this._open.bind(this),
				close: this._close.bind(this)
			}
		};
	}),

	// Private methods
	// ---------------

	_toggle: function() {
		if (this.get('publicAPI.isOpen')) {
			this._close();
		} else {
			this._open();
		}
	},
	_open: function() {
		this.$().addClass('drawer-opened');
		if (this.get("closeOnBodyClick")) {
			this.$().addClass('auto-close');
			this.addBodyListenersTimer = Ember.run.scheduleOnce('afterRender',
				this, this._addBodyListeners);
		}
		if (this.get('closeOnContentsClick')) {
			this.addContentsListenersTimer = Ember.run.scheduleOnce('afterRender',
				this, this._addContentsListeners);
		}
		this.set('publicAPI.isOpen', true);
	},
	_close: function() {
		this.$().removeClass('drawer-opened')
			.removeClass('auto-close');
		this.set('publicAPI.isOpen', false);

		this._removeListeners();
		Ember.run.cancel(this.addBodyListenersTimer);
		this.addBodyListenersTimer = null;
		Ember.run.cancel(this.addContentsListenersTimer);
		this.addContentsListenersTimer = null;
	},

	_addBodyListeners: function() {
		this.get('$body').on(`click.${this.elementId}`, function() {
			if (this.get('publicAPI.isOpen')) {
				this._close();
			}
		}.bind(this));
	},
	_addContentsListeners: function() {
		this.get('$contents').on(`click.${this.elementId}`, function(event) {
			const isOpen = this.get('publicAPI.isOpen');
			if (isOpen && !this._shouldIgnoreInContents(event)) {
				this._close();
			}
		}.bind(this));
	},
	_shouldIgnoreInContents: function(event) {
		const $target = Ember.$(event.target),
			ignore = this.get('ignoreCloseContentsSelector'),
			allowed = this.get('allowCloseContentsSelector');
		const shouldIgnore = $target.is(ignore) ||
			$target.closest(ignore).length;
		// if we specify specific selectors to allow, we will then
		// see if the triggered target matches one of these
		if (!shouldIgnore && Ember.isPresent(allowed)) {
			return !($target.is(allowed) ||
				$target.closest(allowed).length);
		} else {
			return shouldIgnore;
		}
	},
	_removeListeners: function() {
		this.get('$body').off(`.${this.elementId}`);
		this.get('$contents').off(`.${this.elementId}`);
	}
});
