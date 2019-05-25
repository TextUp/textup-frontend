import Component from '@ember/component';
import OwnerPolicy from 'textup-frontend/models/owner-policy';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { tryInvoke } from '@ember/utils';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    self: PropTypes.instanceOf(OwnerPolicy),
    others: PropTypes.array,
    onAvailabilityTypeChange: PropTypes.func,
    onManualAvailabilityChange: PropTypes.func,
    onScheduleAvailabilityChange: PropTypes.func,
  }),
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
