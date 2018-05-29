import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import callIfPresent from '../utils/call-if-present';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    entity: PropTypes.EmberObject.isRequired,
    entityIdentityProp: PropTypes.string,
    onEntityDidChange: PropTypes.func,
    others: PropTypes.oneOfType([PropTypes.EmberObject, PropTypes.arrayOf(PropTypes.EmberObject)]),
    onTypeChange: PropTypes.func,
    onManualAvailabilityChange: PropTypes.func,
    onScheduleAvailabilityChange: PropTypes.func
  },
  getDefaultProps() {
    return { others: [], entityIdentityProp: 'id' };
  },

  didUpdateAttrs({
    newAttrs: { entity: { value: newEntity } },
    oldAttrs: { entity: { value: oldEntity } }
  }) {
    const identProp = this.get('entityIdentityProp');
    if (newEntity.get(identProp) !== oldEntity.get(identProp)) {
      callIfPresent(this.get('onEntityDidChange'), newEntity);
    }
  },

  actions: {
    handleType() {
      callIfPresent(this.get('onTypeChange'), ...arguments);
    },
    handleManualAvailability() {
      callIfPresent(this.get('onManualAvailabilityChange'), ...arguments);
    },
    handleScheduleAvailability() {
      callIfPresent(this.get('onScheduleAvailabilityChange'), ...arguments);
    }
  }
});
