import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import Staff from 'textup-frontend/models/staff';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    staff: PropTypes.instanceOf(Staff),
  }),
});
