import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

// [FUTURE] this component exists to begin to break apart the overreliance on partials
// in the admin dashboard. Right now, this component provides a shortcut way to reliably
// access the numberService. In the future, we'll further componetize this interface
// and this component may no longer be necessary.

export default Ember.Component.extend(PropTypesMixin, {
  stateService: Ember.inject.service(),
  numberService: Ember.inject.service(),

  propTypes: {
    owner: PropTypes.EmberObject,
  },
});
