import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    entity: PropTypes.EmberObject.isRequired,
    entityIdentityProp: PropTypes.string,
    onEntityDidChange: PropTypes.func,
    others: PropTypes.oneOfType([PropTypes.EmberObject, PropTypes.arrayOf(PropTypes.EmberObject)]),
    onTypeChange: PropTypes.func,
    onManualAvailabilityChange: PropTypes.func,
    onScheduleAvailabilityChange: PropTypes.func,
  },
  getDefaultProps() {
    return { others: [], entityIdentityProp: 'id' };
  },

  didUpdateAttrs({
    newAttrs: {
      entity: { value: newEntity },
    },
    oldAttrs: {
      entity: { value: oldEntity },
    },
  }) {
    const identProp = this.get('entityIdentityProp');
    if (newEntity.get(identProp) !== oldEntity.get(identProp)) {
      Ember.tryInvoke(this, 'onEntityDidChange', [newEntity]);
    }
  },

  actions: {
    handleType() {
      Ember.tryInvoke(this, 'onTypeChange', [...arguments]);
    },
    handleManualAvailability() {
      Ember.tryInvoke(this, 'onManualAvailabilityChange', [...arguments]);
    },
    handleScheduleAvailability() {
      Ember.tryInvoke(this, 'onScheduleAvailabilityChange', [...arguments]);
    },
  },
});
