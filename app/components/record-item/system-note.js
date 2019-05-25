import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordNote from 'textup-frontend/models/record-note';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    note: PropTypes.instanceOf(RecordNote).isRequired,
  }),
  classNames: ['record-item', 'record-item--system-message'],
});
