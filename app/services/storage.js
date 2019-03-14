import Ember from 'ember';
import config from '../config/environment';

// With help from http://blog.guya.net/2015/06/12/
// sharing-sessionstorage-between-tabs-for-secure-multi-tab-authentication/

const _s = sessionStorage,
  _l = localStorage;

export default Ember.Service.extend(Ember.Evented, {
  namespace: 'storage',
  syncTimeout: 750, // in ms
  persist: false,

  // Computed properties
  // -------------------

  guid: Ember.computed(() => Ember.guidFor(this)),
  requestKey: Ember.computed('namespace', function() {
    return `get${this.get('namespace')}`;
  }),

  // Events
  // ------

  init() {
    this._super(...arguments);
    // override config properties
    const ns = config.storage.namespace,
      timeout = config.storage.syncTimeout;
    if (ns) {
      this.set('namespace', ns);
    }
    if (parseInt(timeout) > 0) {
      this.set('syncTimeout', parseInt(timeout));
    }
    // bind storage event to handle sync
    Ember.$(window).on(`storage.${this.get('guid')}`, this._doSync.bind(this));
  },
  willDestroy() {
    this._super(...arguments);
    // unbind events
    Ember.$(window).off(`storage.${this.get('guid')}`);
  },

  // Methods
  // -------

  sync() {
    return new Ember.RSVP.Promise(resolve => {
      // set request key to trigger storage event
      this.trySet(_l, this.get('requestKey'), Date.now());
      // resolve promise
      const timeoutTimer = Ember.run.later(
        this,
        function() {
          this.off(config.events.storage.updated, this);
          resolve();
        },
        this.get('syncTimeout')
      );
      this.one(config.events.storage.updated, this, function() {
        Ember.run.cancel(timeoutTimer);
        resolve();
      });
    });
  },
  isItemPersistent(key) {
    return Ember.isPresent(_l.getItem(key));
  },
  getItem(key) {
    return _s.getItem(key) || _l.getItem(key);
  },
  setItem(key, value) {
    this.trySet(_s, key, value);
    if (this.get('persist')) {
      this.trySet(_l, key, value);
    }
  },
  removeItem(key) {
    _l.removeItem(key);
    _s.removeItem(key);
  },
  sendStorage() {
    const ns = this.get('namespace');
    this.trySet(_l, ns, JSON.stringify(_s));
    // if not persisting in local storage, then immediately remove
    // despite this immediate removal, storage event is still sent
    _l.removeItem(ns);
  },

  // Helpers
  // -------

  trySet(storageObj, key, value) {
    try {
      storageObj.setItem(key, value);
    } catch (e) {
      Ember.debug('storage.trySet: web storage not available: ' + e);
    }
  },
  _doSync(event) {
    const req = this.get('requestKey'),
      ns = this.get('namespace'),
      e = event.originalEvent;
    if (e.key === req) {
      this.sendStorage();
    } else if (e.key === ns && e.storageArea === localStorage && Ember.isPresent(e.newValue)) {
      this._receiveStorage(JSON.parse(e.newValue));
    }
  },
  _receiveStorage(data) {
    _s.clear();
    for (let key in data) {
      this.trySet(_s, key, data[key]);
    }
    this.trigger(config.events.storage.updated);
  },
});
