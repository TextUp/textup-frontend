import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    doClose: PropTypes.func.isRequired,
    props: PropTypes.shape({
      title: PropTypes.string.isRequired
    }).isRequired
  },

  classNames: 'slideout-pane__header flex'
});
