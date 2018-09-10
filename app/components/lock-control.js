import Ember from 'ember';
import defaultIfAbsent from '../utils/default-if-absent';
import moment from 'moment';

const { computed, computed: { equal: eq }, run: { scheduleOnce } } = Ember;

export default Ember.Component.extend({
  // injected services
  storage: Ember.inject.service(),

  val: defaultIfAbsent(''),
  numDigits: defaultIfAbsent(4),
  lockOnMultipleFailure: defaultIfAbsent(true),

  tabindex: defaultIfAbsent(0),
  disabled: defaultIfAbsent(false),
  maxNumAttempts: defaultIfAbsent(10),
  lockInSeconds: defaultIfAbsent(300),
  lockTarget: null, // username of currently logged-in user, if available

  successText: defaultIfAbsent('Successfully validated!'),
  workingText: defaultIfAbsent('Validating'),
  lockedText: defaultIfAbsent('Too many incorrect attempts.'),

  storageNamespace: defaultIfAbsent('lock-control'),
  persistStorage: defaultIfAbsent(true),

  successClass: defaultIfAbsent('lock-control-success'),
  errorClass: defaultIfAbsent('form-error'),
  workingClass: defaultIfAbsent('lock-control-working'),
  lockedClass: defaultIfAbsent('lock-control-locked'),
  disabledClass: defaultIfAbsent('form-disabled'),

  // Updates value with new value, following the data down actions up pattern
  // Passed new value
  // Returns nothing, but mutates bound value passed-in
  doUpdate: null,
  // Submits the password, returns a promise for submission status (success/failure)
  // Passed passcode of numDigits length
  // Returns a promise, if not a promise is returned, then throw error
  doSubmit: null,

  classNames: 'lock-control',
  classNameBindings: ['_status', '_addDisabledClass'],

  _status: '',
  _whenUnlock: null,

  // Computed properties
  // -------------------

  _addDisabledClass: computed('disabled', function() {
    return this.get('disabled') ? this.get('disabledClass') : '';
  }),
  _indicators: computed('val', 'numDigits', function() {
    const codeLen = this.get('val.length') || 0,
      numDigits = parseInt(this.get('numDigits')) || 0,
      shouldBeActive = [];
    for (let i = 0; i < numDigits; i++) {
      shouldBeActive.pushObject(i < codeLen);
    }
    return shouldBeActive;
  }),
  _hasError: eq('_status', 'errorClass'),
  _isFull: computed('val', 'numDigits', function() {
    return this.get('val.length') >= this.get('numDigits');
  }),
  _isEmpty: computed('val', function() {
    return this.get('val.length') === 0;
  }),
  _lockDuration: computed('lockInSeconds', function() {
    return moment.duration(this.get('lockInSeconds'), 'seconds');
  }),
  _storageObj: computed('persistStorage', function() {
    return this.get('persistStorage') ? localStorage : sessionStorage;
  }),
  // how many attempts since last successful one
  _numAttemptsKey: computed('storageNamespace', function() {
    return `${this.get('storageNamespace')}--attempts`;
  }),
  // when (datetime) the lock was placed
  _whenLockedKey: computed('storageNamespace', function() {
    return `${this.get('storageNamespace')}--whenlocked`;
  }),
  // for which username the lock was placed
  // if we log back in for the same username, the lock persists
  // if we log into another account, the lock clears
  //    since it was for another username
  _lockedForKey: computed('storageNamespace', function() {
    return `${this.get('storageNamespace')}--lockedfor`;
  }),
  _$input: computed(function() {
    return this.$('.number-control');
  }),

  // Events
  // ------

  didInsertElement: function() {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', this, function() {
      if (this.isTooManyAttempts()) {
        this.tryStartLock();
      }
    });
  },

  // Actions
  // -------

  actions: {
    updateVal: function(newVal) {
      this.updateVal(newVal);
    }
  },

  // Helpers
  // -------

  updateVal: function(newVal) {
    if (this.get('disabled')) {
      return;
    }
    Ember.tryInvoke(this, 'doUpdate', [newVal]);
    this.set('_status', ''); // clear status
    Ember.run.scheduleOnce('afterRender', this, this._verifyVal);
  },
  _verifyVal: function() {
    if (this.get('disabled') || !this.get('_isFull')) {
      return;
    }
    this.set('_status', this.get('workingClass'));
    const result = Ember.tryInvoke(this, 'doSubmit', [this.get('val')]);
    if (result && result.then) {
      result.then(this._onVerifySuccess.bind(this), this._onVerifyFail.bind(this));
    } else {
      this.resetLock();
    }
  },
  _onVerifySuccess: function() {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }
    this.resetLock();
    this.set('_status', this.get('successClass'));
  },
  _onVerifyFail: function() {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }
    this.incrementAttempts();
    if (this.isTooManyAttempts()) {
      this.setLockedForUser();
      this.setWhenLockedToNow();
      this.tryStartLock();
    } else {
      this.set('_status', this.get('errorClass'));
    }
  },

  // Locking
  // -------

  tryStartLock: function() {
    const whenUnlock = this._getWhenLocked().add(this.get('_lockDuration')),
      now = moment();
    this.set('_whenUnlock', whenUnlock);
    this.set('_status', this.get('lockedClass'));
    if (whenUnlock.isBefore(now) || !this.isLockedForSameUser()) {
      this.resetLock();
    } else {
      const timeout = whenUnlock.diff(now);
      Ember.run.later(this, this.resetLock, timeout);
    }
  },
  resetLock: function() {
    const storage = this.get('storage'),
      $input = this.get('_$input');
    storage.removeItem(this.get('_whenLockedKey'));
    storage.removeItem(this.get('_lockedForKey'));
    storage.removeItem(this.get('_numAttemptsKey'));
    // clear locked fields
    this.set('_status', '');
    this.set('_whenUnlock', null);
    scheduleOnce('afterRender', this, () => $input && $input.focus());
  },

  // Locked for helpers
  // ------------------

  setLockedForUser: function() {
    const storage = this.get('storage'),
      obj = this.get('_storageObj'),
      key = this.get('_lockedForKey'),
      user = this.get('lockTarget');
    if (user) {
      storage.trySet(obj, key, user);
    }
  },
  isLockedForSameUser: function() {
    const storage = this.get('storage'),
      key = this.get('_lockedForKey'),
      user = this.get('lockTarget');
    return user ? storage.getItem(key) === user : false;
  },

  // When locked helpers
  // -------------------

  setWhenLockedToNow: function() {
    const whenLocked = moment();
    this.get('storage').trySet(
      this.get('_storageObj'),
      this.get('_whenLockedKey'),
      whenLocked.toDate()
    );
    return whenLocked;
  },
  _getWhenLocked: function() {
    const storage = this.get('storage'),
      key = this.get('_whenLockedKey'),
      whenLocked = moment(storage.getItem(key));
    return whenLocked.isValid() ? whenLocked : this.setWhenLockedToNow();
  },

  // Attempts helpers
  // ----------------

  isTooManyAttempts: function() {
    return this.get('lockOnMultipleFailure') && this._getAttempts() > this.get('maxNumAttempts');
  },
  incrementAttempts: function() {
    const storage = this.get('storage'),
      obj = this.get('_storageObj'),
      key = this.get('_numAttemptsKey');
    storage.trySet(obj, key, this._getAttempts() + 1);
  },
  _getAttempts: function() {
    const storage = this.get('storage'),
      key = this.get('_numAttemptsKey'),
      existing = parseInt(storage.getItem(key));
    return isNaN(existing) ? 0 : existing;
  }
});
