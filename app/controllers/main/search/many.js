import Ember from 'ember';
import MainContactsManyController from 'textup-frontend/controllers/main/contacts/many';

const { filterBy, alias } = Ember.computed;

export default MainContactsManyController.extend({
  isSearch: true,
  searchController: Ember.inject.controller('main.search'),

  selected: filterBy('searchController.searchResults', 'isSelected', true),
  allContacts: alias('searchController.searchResults')
});
