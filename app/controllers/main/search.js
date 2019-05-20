import { empty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  tutorialService: service(),

  queryParams: ['searchQuery'],
  searchQuery: null, // actual search query that is stored in browser history

  searchQueryIsEmpty: empty('searchQuery'),

  _searchQuery: null, // local copy of search query associated with the input

  searchResults: [],
  numTotalSearchResults: null,

  updateResults(results) {
    if (results) {
      this.get('searchResults').pushObjects(results.toArray());
      this.set('numTotalSearchResults', results.get('meta.total'));
    }
  },
});
