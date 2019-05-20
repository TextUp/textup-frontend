import { inject as service } from '@ember/service';
import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

// [FUTURE] this component exists to begin to break apart the overreliance on partials
// in the admin dashboard. Right now, this component provides a shortcut way to reliably
// access the numberService. In the future, we'll further componetize this interface
// and this component may no longer be necessary.

export default Component.extend(PropTypesMixin, {
  stateService: service(),
  numberService: service(),

  propTypes: {
    owner: PropTypes.EmberObject,
  },
});
