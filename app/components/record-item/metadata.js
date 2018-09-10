import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    timestamp: PropTypes.oneOfType([PropTypes.date, PropTypes.null]),
    author: PropTypes.oneOfType([PropTypes.string, PropTypes.null])
  },
  classNames: ['record-item__metadata']
});
