import Ember from 'ember';

const { computed } = Ember;

export default Ember.Controller.extend({
  tutorialService: Ember.inject.service(),

  queryParams: ['searchQuery'],
  searchQuery: null, // actual search query that is stored in browser history

  searchQueryIsEmpty: computed.empty('searchQuery'),

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
