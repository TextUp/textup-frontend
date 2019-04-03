import callIfPresent from 'textup-frontend/utils/call-if-present';
import Ember from 'ember';

const { isBlank, isPresent, computed, run } = Ember;

export default Ember.Route.extend({
  storage: Ember.inject.service(),

  queryParams: { searchQuery: { refreshModel: true } },

  _prevUrl: null,
  _prevUrlIsSearch: computed.match('_prevUrl', /main\/.*\/search/),

  activate() {
    this.set('_prevUrl', this.get('storage').getItem('currentUrl'));
  },
  deactivate() {
    this.controller.set('searchQuery', null);
  },

  actions: {
    didTransition() {
      this._super(...arguments);
      if (this.controller.get('searchQueryIsEmpty')) {
        run.scheduleOnce('afterRender', () => Ember.$('.search-input').focus());
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
      numResults: null,
    });
    callIfPresent(null, this.controller.get('searchList.actions.resetAll'));
  },
  _doSearch() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const search = this.controller.get('searchQuery'),
        offset = this.controller.get('searchResults.length'),
        teamId = this.get('stateManager.ownerAsTeam.id');
      if (isBlank(search)) {
        return resolve();
      }
      this.get('dataService')
        .request(this.store.query('contact', { search, offset, teamId }))
        .then(results => {
          this.controller.updateResults(results);
          resolve();
        }, reject);
    });
  },
});
