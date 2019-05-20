import { inject as controller } from '@ember/controller';
import { alias, filterBy } from '@ember/object/computed';
import MainContactsManyController from 'textup-frontend/controllers/main/contacts/many';

export default MainContactsManyController.extend({
  isSearch: true,
  searchController: controller('main.search'),

  selected: filterBy('searchController.searchResults', 'isSelected', true),
  allContacts: alias('searchController.searchResults')
});
