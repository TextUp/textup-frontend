import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    entity: PropTypes.EmberObject.isRequired,
    dayOfWeek: PropTypes.string,
  },

  _showAllDays: computed.empty('dayOfWeek'),
});
