import Component from '@ember/component';
import OwnerPolicy from 'textup-frontend/models/owner-policy';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { empty } from '@ember/object/computed';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    policy: PropTypes.instanceOf(OwnerPolicy).isRequired,
    dayOfWeek: PropTypes.string,
  }),

  // Internal properties
  // -------------------

  _showAllDays: empty('dayOfWeek'),
});
