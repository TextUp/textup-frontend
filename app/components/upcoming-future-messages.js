import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { computed } from '@ember/object';
import { empty } from '@ember/object/computed';
import { tryInvoke } from '@ember/utils';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    nextFutureFire: PropTypes.date,
    onClick: PropTypes.func,
  }),
  classNames: 'upcoming-future-messages',
  classNameBindings: [
    '_dateMissing:upcoming-future-messages--no-upcoming',
    '_isInPast:upcoming-future-messages--no-upcoming',
  ],

  click() {
    tryInvoke(this, 'onClick', [...arguments]);
  },

  // Internal properties
  // -------------------

  _isInPast: computed('nextFutureFire', function() {
    return this.get('nextFutureFire') < Date.now();
  }),
  _dateMissing: empty('nextFutureFire'),
});
