import Component from '@ember/component';
import PropertyUtils from 'textup-frontend/utils/property';
import PropTypesMixin, { PropTypes } from 'ember-prop-types';
import Staff from 'textup-frontend/models/staff';
import { computed } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import { tryInvoke } from '@ember/utils';

export default Component.extend(PropTypesMixin, {
  propTypes: Object.freeze({
    doRegister: PropTypes.func,
    staff: PropTypes.instanceOf(Staff),
    firstControlClass: PropTypes.string,

    // only needed if modifying phone (i.e., transfer, deactivate, change number, etc.)
    canModifyPhone: PropTypes.bool,
    onSearchAvailableNumbers: PropTypes.func,

    // used for non-new staff only
    onRevert: PropTypes.func,
    onSave: PropTypes.func,
    onUpdateLockCode: PropTypes.func,
    onUpdatePassword: PropTypes.func,
    onUpdateUsername: PropTypes.func,
    onValidateCredentials: PropTypes.func,
  }),
  getDefaultProps() {
    return { firstControlClass: '', canModifyPhone: false };
  },

  classNames: 'form',

  init() {
    this._super(...arguments);
    scheduleOnce('afterRender', () => tryInvoke(this, 'doRegister', [this.get('_publicAPI')]));
  },

  // Internal properties
  // -------------------

  _newPasswordCopy: null,
  _passwordWithConfirm: null,
  _numWithConfirmsOpen: 0,
  _publicAPI: computed(function() {
    return {
      isModifyingAPropertyRequiringConfirm: false,
    };
  }),

  // Internal handlers
  // -----------------

  _onOpenPasswordWithConfirm() {
    this._onOpenWithConfirm();
    this.set('_newPasswordCopy', null);
  },
  _onOpenWithConfirm() {
    this._updateWithConfirmState(this.get('_numWithConfirmsOpen') + 1);
  },
  _onCloseWithConfirm() {
    this._updateWithConfirmState(this.get('_numWithConfirmsOpen') - 1);
  },
  _updateWithConfirmState(newNum) {
    this.setProperties({
      _numWithConfirmsOpen: newNum,
      '_publicAPI.isModifyingAPropertyRequiringConfirm': newNum !== 0,
    });
  },

  _onSaveAndThen(then) {
    return PropertyUtils.ensurePromise(tryInvoke(this, 'onSave')).then(() =>
      PropertyUtils.callIfPresent(then)
    );
  },
});
