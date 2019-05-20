import { match } from '@ember/object/computed';
import { Promise } from 'rsvp';
import $ from 'jquery';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { isPresent, isBlank } from '@ember/utils';
import { run } from '@ember/runloop';
import callIfPresent from 'textup-frontend/utils/call-if-present';

export default Route.extend({
  requestService: service(),
  storageService: service(),

  queryParams: { searchQuery: { refreshModel: true } },

  _prevUrl: null,
  _prevUrlIsSearch: match('_prevUrl', /main\/.*\/search/),

  activate() {
    this.set('_prevUrl', this.get('storageService').getItem('currentUrl'));
  },
  deactivate() {
    this.controller.set('searchQuery', null);
  },

  actions: {
    didTransition() {
      this._super(...arguments);
      if (this.controller.get('searchQueryIsEmpty')) {
        run.scheduleOnce('afterRender', () => $('.search-input').focus());
      }
      this._setupSearch();
      return true;
    },
    // for changing filter on the mobile slideout menu
    changeFilter(filter) {
      this.transitionTo('main.contacts', { queryParams: { filter } });
    },

    // Search functions
    // ----------------

    closeSearch() {
      // only transition to stored previous url if it is present
      // and if it is not already the search page itself
      const prevUrl = this.get('_prevUrl');
      if (!this.get('_prevUrlIsSearch') && isPresent(prevUrl)) {
        this.transitionTo(prevUrl);
      } else {
        this.transitionTo('main.contacts');
      }
    },
    triggerSearch(searchQuery) {
      if (!isBlank(searchQuery)) {
        // transition to main.search to close any open search
        // results when we are performing a new search
        this.transitionTo('main.search', { queryParams: { searchQuery } });
      }
    },

    // Performing search
    // -----------------

    refresh() {
      this.controller.get('searchResults').clear();
      return this._doSearch();
    },
    loadMore() {
      return this._doSearch();
    },
  },

  _setupSearch() {
    this.controller.setProperties({
      _searchQuery: this.controller.get('searchQuery'),
      searchResults: [],
      numTotalSearchResults: null,
    });
    callIfPresent(null, this.controller.get('searchList.actions.resetAll'));
  },

  _doSearch() {
    return new Promise((resolve, reject) => {
      const search = this.controller.get('searchQuery'),
        offset = this.controller.get('searchResults.length');
      if (isBlank(search)) {
        return resolve();
      }
      // teamId added by `contact` adapter
      this.get('requestService')
        .handleIfError(this.store.query('contact', { search, offset }))
        .then(results => {
          this.controller.updateResults(results);
          resolve();
        }, reject);
    });
  },
});
