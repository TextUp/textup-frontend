import MainContactsManyController from 'textup-frontend/controllers/main/contacts/many';
import { inject as controller } from '@ember/controller';
import { readOnly, filterBy } from '@ember/object/computed';

export default MainContactsManyController.extend({
  searchController: controller('main.search'),

  // @Override
  selectedContacts: filterBy('searchController.searchResults', 'isSelected', true),
  // @Override
  allContacts: readOnly('searchController.searchResults'),

  // Internal
  // --------

  // @Override
  _backRouteName: 'main.contacts',
});
