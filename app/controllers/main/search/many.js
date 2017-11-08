import Ember from 'ember';
import MainContactsManyController from '../contacts/many';

const { filterBy, alias } = Ember.computed;

export default MainContactsManyController.extend({
  isSearch: true,
  searchController: Ember.inject.controller('main.search'),

  selected: filterBy('searchController.searchResults', 'isSelected', true),
  allContacts: alias('searchController.searchResults'),

  _exitMany: function() {
    this.transitionToRoute('main.search');
  }
});
