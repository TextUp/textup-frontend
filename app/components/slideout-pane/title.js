import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
  },

  classNames: 'slideout-pane__header flex',
});
