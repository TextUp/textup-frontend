import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    entity: PropTypes.EmberObject,
  },

  tagName: 'span',
  classNames: 'horizontal-items',
});
