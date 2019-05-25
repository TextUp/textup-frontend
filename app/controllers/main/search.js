import Controller from '@ember/controller';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import { empty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { match } from '@ember/object/computed';

export default Controller.extend({
  tutorialService: service(),

  queryParams: ['searchQuery'],
  searchQuery: null,

  searchList: null,
  searchQueryIsEmpty: empty('searchQuery'),
  searchResults: computed(() => []),
  numTotalSearchResults: null,

  _prevUrl: null,
  _prevUrlIsSearch: match('_prevUrl', /main\/.*\/search/),

  actions: {
    triggerSearch(searchQuery) {
      if (!isBlank(searchQuery)) {
        this.transitionToRoute('main.search', { queryParams: { searchQuery } });
      }
    },
    closeSearch() {
      if (this.get('_prevUrlIsSearch')) {
        this.transitionToRoute('main.contacts');
      } else {
        this.transitionToRoute(this.get('_prevUrl'));
      }
    },
    refresh() {
      this.get('searchResults').clear();
      return this._doSearch();
    },
    loadMore() {
      return this._doSearch();
    },
    toggleSelected(contact) {
      if (contact) {
        this.transitionTo('main.search.many');
        contact.toggleProperty('isSelected');
      }
    },
  },

  _doSearch() {
    return new RSVP.Promise((resolve, reject) => {
      const search = this.get('searchQuery'),
        offset = this.get('searchResults.length');
      if (isBlank(search)) {
        return resolve();
      }
      // teamId added by `contact` adapter
      this.get('requestService')
        .handleIfError(this.get('store').query('contact', { search, offset }))
        .then(results => {
          if (results) {
            this.get('searchResults').pushObjects(results.toArray());
            this.set('numTotalSearchResults', results.get('meta.total'));
          }
          resolve();
        }, reject);
    });
  },
});
