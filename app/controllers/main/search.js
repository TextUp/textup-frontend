import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['searchQuery'],
  searchQuery: null, // actual search query that is stored in browser history

  _searchQuery: null, // local copy of search query associated with the input

  searchResults: [],
  numResults: '--',
});
