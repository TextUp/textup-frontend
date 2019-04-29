import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, tryInvoke, RSVP, run } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    doRegister: PropTypes.func.isRequired,
    onDestroy: PropTypes.func.isRequired,
    title: PropTypes.string,
  },
  getDefaultProps() {
    return { title: '' };
  },

  classNames: 'tab-container__item',
  classNameBindings: '_isPending:tab-container__item--pending',

  init() {
    this._super(...arguments);
    tryInvoke(this, 'doRegister', [this.get('_publicAPI')]);
  },
  didReceiveAttrs() {
    this._super(...arguments);
    run.scheduleOnce('afterRender', () => this.set('_publicAPI.title', this.get('title')));
  },
  willDestroyElement() {
    this._super(...arguments);
    tryInvoke(this, 'onDestroy', [this.get('_publicAPI')]);
  },

  // Internal properties
  // -------------------

  _isPending: true,
  _shouldRender: false,
  _publicAPI: computed(function() {
    return {
      title: this.get('title'),
      actions: {
        initialize: this._initialize.bind(this),
        hide: this._hide.bind(this),
        show: this._show.bind(this),
      },
    };
  }),

  _initialize(shouldShow) {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    run.join(() => {
      if (shouldShow) {
        this._show().then(() => this._notPending());
      } else {
        this._hide().then(() => this._notPending());
      }
    });
  },
  _show() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    return run.join(() => {
      this.set('_shouldRender', true);
      return new RSVP.Promise(resolve => this.$().fadeIn('fast', resolve));
    });
  },
  _hide() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    return run.join(() => new RSVP.Promise(resolve => this.$().fadeOut('fast', resolve)));
  },

  _notPending() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    run(() => this.set('_isPending', false));
  },
});
