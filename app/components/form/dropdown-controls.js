import Component from '@ember/component';
import { tryInvoke } from '@ember/utils';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    isMarkedForDelete: PropTypes.bool,
    isDirty: PropTypes.bool,
    isValid: PropTypes.bool,
    onMarkForDelete: PropTypes.func,
    onUndoDelete: PropTypes.func,
    onCancel: PropTypes.func,
    onSave: PropTypes.func
  },
  getDefaultProps() {
    return { isMarkedForDelete: false, isDirty: false, isValid: false };
  },

  // Internal handlers
  // -----------------

  _onMarkForDelete() {
    tryInvoke(this, 'onMarkForDelete');
  },
  _onUndoDelete() {
    tryInvoke(this, 'onUndoDelete');
  },
  _onCancel() {
    tryInvoke(this, 'onCancel');
  },
  _onSave() {
    tryInvoke(this, 'onSave');
  }
});
