import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    entity: PropTypes.EmberObject.isRequired,
  },

  tagName: '',
});
