import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, tryInvoke } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    nextFutureFire: PropTypes.date,
    onClick: PropTypes.func
  },
  classNames: 'upcoming-future-messages',
  classNameBindings: [
    '_dateMissing:upcoming-future-messages--no-upcoming',
    '_isInPast:upcoming-future-messages--no-upcoming'
  ],

  click() {
    tryInvoke(this, 'onClick', [...arguments]);
  },

  // Internal properties
  // -------------------

  _isInPast: computed('nextFutureFire', function() {
    return this.get('nextFutureFire') < Date.now();
  }),
  _dateMissing: computed.empty('nextFutureFire')
});
