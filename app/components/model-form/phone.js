import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import Staff from 'textup-frontend/models/staff';
import Team from 'textup-frontend/models/team';
import { computed } from '@ember/object';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    phoneOwner: PropTypes.oneOfType([PropTypes.instanceOf(Staff), PropTypes.instanceOf(Team)]),
    canModifyPhone: PropTypes.bool,
    onSearchAvailableNumbers: PropTypes.func,
  }),
  getDefaultProps() {
    return { canModifyPhone: false };
  },

  // Internal properties
  // -------------------

  _phoneOwnerOrg: computed('phoneOwner', function() {
    const phoneOwner = this.get('phoneOwner');
    // Both staff and team models have a property named `org`
    return phoneOwner ? phoneOwner.get('org') : null;
  }),
});
