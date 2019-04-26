import Ember from 'ember';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, tryInvoke, run } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    val: PropTypes.oneOfType([PropTypes.string, PropTypes.null]),
    doUpdateVal: PropTypes.func.isRequired,
    doValidate: PropTypes.func.isRequired,

    totalPadDigits: PropTypes.number,
  },

  getDefaultProps() {
    return {
      totalPadDigits: 4,
    };
  },

  classNames: ['single-body', 'lock-pad'],
  classNameBindings: ['_isError:lock-pad--error'],

  didUpdateAttrs() {
    this._super(...arguments);
    run.debounce(this, this._checkValidate, 500);
  },

  _checkValidate() {
    if (
      this.get('val.length') >= this.get('totalPadDigits') &&
      !this.isDestroyed &&
      !this.isDestroying
    ) {
      this.set('_isLoading', true);
      const retVal = tryInvoke(this, 'doValidate', [this.get('val')]);
      if (retVal && retVal.catch) {
        retVal
          .catch(() => {
            run(() => {
              this.set('_isLoading', false);
              this.set('_isError', true);
            });
          })
          .finally(() => run(() => this.set('_isLoading', false)));
      } else {
        this.set('_isLoading', false);
        console.log('doValidate did not return a promise');
      }
    }
  },

  // Helpers
  // -------

  _doUpdateVal(newVal) {
    this.set('_isError', false);
    Ember.tryInvoke(this, 'doUpdateVal', [newVal]);
  },

  // Computed properties
  // -------------------

  _valLength: computed('val.length', function() {
    return this.get('val.length') || 0;
  }),

  _valIndices: computed('totalPadDigits', function() {
    const times = this.get('totalPadDigits');
    return Array(times).fill();
  }),
});
