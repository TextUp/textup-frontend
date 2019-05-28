import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordNote from 'textup-frontend/models/record-note';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    note: PropTypes.instanceOf(RecordNote).isRequired,
    onEdit: PropTypes.func,
    onRestore: PropTypes.func,
    onViewHistory: PropTypes.func,
    readOnly: PropTypes.bool,
  }),
  getDefaultProps() {
    return { readOnly: false };
  },
  classNames: ['record-item', 'record-item--note'],
});
