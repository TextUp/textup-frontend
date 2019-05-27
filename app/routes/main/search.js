import $ from 'jquery';
import Route from '@ember/routing/route';
import StorageUtils from 'textup-frontend/utils/storage';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';

export default Route.extend({
  requestService: service(),
  storageService: service(),

  queryParams: { searchQuery: { refreshModel: true } },

  setupController(controller) {
    this._super(...arguments);
    // TODO check if this works or if we need to do this in `activate`
    controller.set('_prevUrl', this.get('storageService').getItem(StorageUtils.currentUrlKey()));
  },
  resetController(controller, isExiting) {
    this._super(...arguments);
    if (isExiting) {
      controller.set('searchQuery', null);
    } else {
      if (controller.get('searchQueryIsEmpty')) {
        scheduleOnce('afterRender', () => $('.search-input').focus());
      }
      controller.setProperties({
        _searchQuery: controller.get('searchQuery'),
        searchResults: [],
        numTotalSearchResults: null,
      });
      PropertyUtils.callIfPresent(controller.get('searchList.actions.resetAll'));
    }
  },
});
