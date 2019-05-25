import Component from '@ember/component';
import Team from 'textup-frontend/models/team';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    onSearchAvailableNumbers: PropTypes.func,
    onLocationError: PropTypes.func,

    team: PropTypes.instanceOf(Team),
    firstControlClass: PropTypes.string,
    canModifyPhone: PropTypes.bool,
  }),
  getDefaultProps() {
    return { firstControlClass: '', canModifyPhone: false };
  },

  classNames: 'form',
});
