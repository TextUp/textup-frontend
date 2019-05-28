import Component from '@ember/component';
import Constants from 'textup-frontend/constants';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { notEmpty, equal } from '@ember/object/computed';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    shouldShow: PropTypes.any,
    currentStatus: PropTypes.oneOfType([
      PropTypes.null,
      PropTypes.oneOf(Object.values(Constants.STAFF.STATUS)),
    ]),
    onChange: PropTypes.func,
  }),
  getDefaultProps() {
    return { shouldShow: true, currentStatus: null };
  },

  tagName: '',

  // Internal properties
  // -------------------

  _currentStatusNotProvided: notEmpty('currentStatus'),
  _isCurrentlyAdmin: equal('currentStatus', Constants.STAFF.STATUS.ADMIN),
  _isCurrentlyStaff: equal('currentStatus', Constants.STAFF.STATUS.STAFF),
  _isCurrentlyBlocked: equal('currentStatus', Constants.STAFF.STATUS.BLOCKED),
});
