import Ember from 'ember';
import OwnerPolicy from 'textup-frontend/models/owner-policy';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    self: PropTypes.instanceOf(OwnerPolicy),
    others: PropTypes.instanceOf(Ember.ArrayProxy),
    onAvailabilityTypeChange: PropTypes.func,
    onManualAvailabilityChange: PropTypes.func,
    onScheduleAvailabilityChange: PropTypes.func,
  },
  getDefaultProps() {
    return { others: [] };
  },

  // Internal handlers
  // -----------------

  _handleType() {
    tryInvoke(this, 'onAvailabilityTypeChange', [...arguments]);
  },
  _handleManualAvailability() {
    tryInvoke(this, 'onManualAvailabilityChange', [...arguments]);
  },
  _handleScheduleAvailability() {
    tryInvoke(this, 'onScheduleAvailabilityChange', [...arguments]);
  },
});
