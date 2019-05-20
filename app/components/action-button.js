import Component from '@ember/component';
import { get } from '@ember/object';
import { typeOf, tryInvoke } from '@ember/utils';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    onAction: PropTypes.func.isRequired,
    error: PropTypes.bool,
    disabled: PropTypes.bool,
    type: PropTypes.oneOf(['button', 'submit', 'reset'])
  },
  getDefaultProps() {
    return { error: false, disabled: false, type: 'button' };
  },
  tagName: 'button',
  attributeBindings: ['type', 'disabled'],
  classNames: ['action-button'],
  classNameBindings: [
    'error:action-button--error',
    'disabled:action-button--disabled',
    '_isLoading:action-button--loading'
  ],

  click() {
    if (this.get('disabled')) {
      return;
    }
    const result = tryInvoke(this, 'onAction', [...arguments]);
    if (result && typeOf(get(result, 'then')) === 'function') {
      this.setProperties({ error: false, _isLoading: true });
      result.then(() => this._afterLoad(true), () => this._afterLoad(false));
    }
  },

  // Internal properties
  // -------------------

  _isLoading: false,

  // Internal handlers
  // -----------------

  _afterLoad(isSuccess) {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this.setProperties({ error: !isSuccess, _isLoading: false });
  }
});
