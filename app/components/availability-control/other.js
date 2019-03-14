import Ember from 'ember';
import OwnerPolicy from 'textup-frontend/models/owner-policy';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    policy: PropTypes.instanceOf(OwnerPolicy).isRequired,
    dayOfWeek: PropTypes.string,
  },

  // Internal properties
  // -------------------

  _showAllDays: computed.empty('dayOfWeek'),
});
