import { match, readOnly } from '@ember/object/computed';
import { removeObserver, addObserver } from '@ember/object/observers';
import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { run } from '@ember/runloop';
import { typeOf } from '@ember/utils';
import ArrayUtils from 'textup-frontend/utils/array';
import config from 'textup-frontend/config/environment';
import StorageUtils from 'textup-frontend/utils/storage';
import TypeUtils from 'textup-frontend/utils/type';

export default Service.extend({
  router: service(),
  storageService: service(),

  willDestroy() {
    this._super(...arguments);
    removeObserver(this.get('router'), 'currentURL', this, this._scheduleUpdateTrackedUrl);
  },

  // Properties
  // ----------

  viewingContacts: match('router.currentRouteName', /main.contacts/),
  viewingTag: match('router.currentRouteName', /main.tag/),
  viewingSearch: match('router.currentRouteName', /main.search/),
  viewingMany: match('router.currentRouteName', /many/),
  viewingPeople: match('router.currentRouteName', /admin.people/),
  viewingTeam: match('router.currentRouteName', /admin.team/),
  currentRouteName: readOnly('router.currentRouteName'),

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
    addObserver(this.get('router'), 'currentURL', this, this._scheduleUpdateTrackedUrl);
    // determing if stored url should be restored
    const storedUrl = this.get('storageService').getItem(StorageUtils.currentUrlKey());
    if (storedUrl && typeOf(targetRouteName) === 'string') {
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
