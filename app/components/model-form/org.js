import Component from '@ember/component';
import Organization from 'textup-frontend/models/organization';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    org: PropTypes.instanceOf(Organization),
    onRevertTimeout: PropTypes.func,
    onLocationError: PropTypes.func,
  }),

  classNames: 'form',
});
