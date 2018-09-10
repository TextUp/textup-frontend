import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordText from 'textup-frontend/models/record-text';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    text: PropTypes.instanceOf(RecordText).isRequired
  },
  classNames: ['record-item', 'record-item--text']
});
