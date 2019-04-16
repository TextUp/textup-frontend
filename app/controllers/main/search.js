import Ember from 'ember';

export default Ember.Controller.extend({
  tutorialService: Ember.inject.service(),

  queryParams: ['searchQuery'],
  searchQuery: null, // actual search query that is stored in browser history

  _searchQuery: null, // local copy of search query associated with the input

  searchResults: [],
  numResults: '--'
});
