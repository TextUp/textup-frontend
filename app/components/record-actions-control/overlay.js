import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { tryInvoke } from '@ember/utils';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    show: PropTypes.bool,
    onClose: PropTypes.func,
    closeButtonLabel: PropTypes.string,
    showCloseButton: PropTypes.bool,
  }),
  getDefaultProps() {
    return { show: false, closeButtonLabel: 'Close', showCloseButton: true };
  },

  classNames: 'record-actions-control__overlay',
  classNameBindings: 'show:record-actions-control__overlay--open',

  // Internal handlers
  // -----------------

  _close() {
    tryInvoke(this, 'onClose', [...arguments]);
  },
});
