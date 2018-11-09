import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    count: PropTypes.number
  },
  getDefaultProps() {
    return { count: 0 };
  },

  tagName: 'span',
  classNames: 'count-badge',

  // Internal properties
  // -------------------

  _count: computed('count', function() {
    const count = this.get('count');
    return count > 100 ? '99+' : count;
  })
});
