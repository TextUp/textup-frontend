import Component from '@ember/component';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import { computed } from '@ember/object';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    indicatorNum: PropTypes.number,
    numFilled: PropTypes.number,
  }),
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
