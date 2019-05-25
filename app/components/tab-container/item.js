import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import { run, scheduleOnce, join } from '@ember/runloop';
import { tryInvoke } from '@ember/utils';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    doRegister: PropTypes.func.isRequired,
    onDestroy: PropTypes.func.isRequired,
    title: PropTypes.string,
  }),
  getDefaultProps() {
    return { title: '' };
  },

  classNames: 'tab-container__item',
  classNameBindings: '_isPending:tab-container__item--pending',

  init() {
    this._super(...arguments);
    scheduleOnce('afterRender', () => tryInvoke(this, 'doRegister', [this.get('_publicAPI')]));
  },
  didReceiveAttrs() {
    this._super(...arguments);
    scheduleOnce('afterRender', () => this.set('_publicAPI.title', this.get('title')));
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
    join(() => {
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
    return join(() => {
      this.set('_shouldRender', true);
      return new RSVP.Promise(resolve => this.$().fadeIn('fast', resolve));
    });
  },
  _hide() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    return join(() => new RSVP.Promise(resolve => this.$().fadeOut('fast', resolve)));
  },

  _notPending() {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    run(() => this.set('_isPending', false));
  },
});
