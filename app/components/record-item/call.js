import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import RecordCall from 'textup-frontend/models/record-call';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    call: PropTypes.instanceOf(RecordCall).isRequired
  },
  classNames: ['record-item', 'record-item--call']
});
