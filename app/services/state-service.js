import ArrayUtils from 'textup-frontend/utils/array';
import config from 'textup-frontend/config/environment';
import Ember from 'ember';
import StorageUtils from 'textup-frontend/utils/storage';
import TypeUtils from 'textup-frontend/utils/type';

const { computed, run } = Ember;

export default Ember.Service.extend({
  router: Ember.inject.service(),
  storageService: Ember.inject.service(),

  willDestroy() {
    this._super(...arguments);
    Ember.removeObserver(this, 'router.currentURL', this, this._scheduleUpdateTrackedUrl);
  },

  // Properties
  // ----------

  viewingContacts: computed.match('router.currentRouteName', /main.contacts/),
  viewingTag: computed.match('router.currentRouteName', /main.tag/),
  viewingSearch: computed.match('router.currentRouteName', /main.search/),
  viewingMany: computed.match('router.currentRouteName', /many/),
  viewingPeople: computed.match('router.currentRouteName', /admin.people/),
  viewingTeam: computed.match('router.currentRouteName', /admin.team/),
  currentRouteName: computed.readOnly('router.currentRouteName'),

  // the current phone owner -- may be the logged-in user or a team that the user is on
  owner: null,
  ownerIsTeam: computed('owner', function() {
    return TypeUtils.isTeam(this.get('owner'));
  }),
  ownerAsTeam: computed('owner', 'ownerIsTeam', function() {
    return this.get('ownerIsTeam') ? this.get('owner') : null;
  }),
  ownerIsOrg: computed('owner', function() {
    return TypeUtils.isOrg(this.get('owner'));
  }),
  ownerAsOrg: computed('owner', 'ownerIsOrg', function() {
    return this.get('ownerIsOrg') ? this.get('owner') : null;
  }),

  // Methods
  // -------

  startTrackingAndGetUrlToRestoreIfNeeded(targetRouteName) {
    // start tracking
    Ember.addObserver(this, 'router.currentURL', this, this._scheduleUpdateTrackedUrl);
    // determing if stored url should be restored
    const storedUrl = this.get('storageService').getItem(StorageUtils.currentUrlKey());
    if (storedUrl && targetRouteName) {
      // We do NOT want to restore if we are heading towards certain specific targets
      const shouldIgnoreRestore = ArrayUtils.ensureArrayAndAllDefined(
        config.state.ignoreRestoreStoredUrlRouteNames
      ).any(loc => targetRouteName.includes(loc));
      return shouldIgnoreRestore ? null : storedUrl;
    }
  },

  // Internal
  // --------

  _scheduleUpdateTrackedUrl() {
    run.next(this, this._updateTrackedUrl);
  },
  _updateTrackedUrl() {
    this.get('storageService').setItem(StorageUtils.currentUrlKey(), this.get('router.currentURL'));
  },
});
