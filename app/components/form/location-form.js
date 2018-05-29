import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Ember.Component.extend({
  propTypes: {
    entity: PropTypes.EmberObject.isRequired,
    onLocationError: PropTypes.func.isRequired
  }
});
