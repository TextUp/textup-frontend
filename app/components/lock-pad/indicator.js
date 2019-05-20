import Component from '@ember/component';
import { computed } from '@ember/object';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

export default Component.extend(PropTypesMixin, {
  propTypes: {
    indicatorNum: PropTypes.number,
    numFilled: PropTypes.number,
  },

  getDefaultProps() {
    return { indicatorNum: 0, numFilled: 0 };
  },

  classNames: 'lock-pad__indicator',
  classNameBindings: '_isFilled:lock-pad__indicator--filled',

  // Internal properties
  // -------------------

  _isFilled: computed('indicatorNum', 'numFilled', function() {
    return this.get('numFilled') >= this.get('indicatorNum');
  }),
});
