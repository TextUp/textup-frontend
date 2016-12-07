import Ember from 'ember';

const {
	alias
} = Ember.computed;

export default Ember.Controller.extend({
	queryParams: ['searchQuery'],
	searchQuery: null, // actual search query that is stored in browser history

	_searchQuery: null, // local copy of search query associated with the input

	searchResults: [],
	numResults: '--',

	// if we are transitioning to a new search term, we don't want to resolve
	// search for the old search term
	_transitioning: alias('mainController._transitioning'),
});
