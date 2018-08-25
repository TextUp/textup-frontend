import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordNote from 'textup-frontend/models/record-note';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    note: PropTypes.instanceOf(RecordNote).isRequired
  },
  classNames: ['record-item', 'record-item--system-message']
});
