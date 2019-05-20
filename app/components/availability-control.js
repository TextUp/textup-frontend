import Component from '@ember/component';
import { tryInvoke } from '@ember/utils';
import OwnerPolicy from 'textup-frontend/models/owner-policy';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    self: PropTypes.instanceOf(OwnerPolicy),
    others: PropTypes.array,
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
