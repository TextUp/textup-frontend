import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    isMarkedForDelete: PropTypes.bool,
    isDirty: PropTypes.bool,
    isValid: PropTypes.bool,
    onMarkForDelete: PropTypes.func,
    onUndoDelete: PropTypes.func,
    onCancel: PropTypes.func,
    onSave: PropTypes.func,
  }),
  getDefaultProps() {
    return { isMarkedForDelete: false, isDirty: false, isValid: false };
  },
});
