import { empty } from '@ember/object/computed';
import Component from '@ember/component';
import OwnerPolicy from 'textup-frontend/models/owner-policy';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    policy: PropTypes.instanceOf(OwnerPolicy).isRequired,
    dayOfWeek: PropTypes.string,
  },

  // Internal properties
  // -------------------

  _showAllDays: empty('dayOfWeek'),
});
