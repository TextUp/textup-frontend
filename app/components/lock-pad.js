import Ember from 'ember';
import PropertyUtils from 'textup-frontend/utils/property';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';

const { computed, tryInvoke, run } = Ember;

export default Ember.Component.extend(PropTypesMixin, {
  propTypes: {
    doUpdateVal: PropTypes.func.isRequired,
    doValidate: PropTypes.func.isRequired,
    val: PropTypes.oneOfType([PropTypes.string, PropTypes.null]),
    totalPadDigits: PropTypes.number,
  },
  getDefaultProps() {
    return { totalPadDigits: 4 };
  },

  classNames: ['single-body', 'lock-pad'],
  classNameBindings: ['_isError:lock-pad--error'],

  didUpdateAttrs() {
    this._super(...arguments);
    run.debounce(this, this._checkValidate, 500);
  },

  // Internal properties
  // -------------------

  _valLength: computed('val.length', function() {
    return this.get('val.length') || 0;
  }),
  _valIndices: computed('totalPadDigits', function() {
    return Array(this.get('totalPadDigits')).fill();
  }),

  // Internal handlers
  // -----------------

  _checkValidate() {
    if (
      this.get('val.length') >= this.get('totalPadDigits') &&
      !this.get('isDestroyed') &&
      !this.get('isDestroying')
    ) {
      this.set('_isLoading', true);
      PropertyUtils.ensurePromise(tryInvoke(this, 'doValidate', [this.get('val')]))
        .catch(() => run.join(() => this.set('_isError', true)))
        .finally(() => run.join(() => this.set('_isLoading', false)));
    }
  },
  _doUpdateVal(newVal) {
    this.set('_isError', false);
    tryInvoke(this, 'doUpdateVal', [newVal]);
  },
});
