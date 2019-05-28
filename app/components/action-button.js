import Component from '@ember/component';
import PropertyUtils from 'textup-frontend/utils/property';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { tryInvoke } from '@ember/utils';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    onAction: PropTypes.func.isRequired,
    error: PropTypes.bool,
    disabled: PropTypes.bool,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
  }),
  getDefaultProps() {
    return { error: false, disabled: false, type: 'button' };
  },
  tagName: 'button',
  attributeBindings: ['type', 'disabled'],
  classNames: ['action-button'],
  classNameBindings: [
    'error:action-button--error',
    'disabled:action-button--disabled',
    '_isLoading:action-button--loading',
  ],

  click() {
    if (this.get('disabled')) {
      return;
    }
    this.setProperties({ error: false, _isLoading: true });
    PropertyUtils.ensurePromise(tryInvoke(this, 'onAction', [...arguments])).then(
      this._afterLoad.bind(this, true),
      this._afterLoad.bind(this, false)
    );
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
  },
});
