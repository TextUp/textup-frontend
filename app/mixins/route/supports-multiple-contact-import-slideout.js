import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';
import Ember from 'ember';

export default Ember.Mixin.create({
  contactImportService: Ember.inject.service(),

  actions: {
    // 1. open slideout
    startMultipleContactImport() {
      this.send(
        'toggleSlideout',
        'slideouts/contact/import',
        AppUtils.controllerNameForRoute(this),
        Constants.SLIDEOUT.OUTLET.DEFAULT
      );
    },

    // 2. close and do nothing
    cancelMultipleExportSlideout() {
      this.get('contactImportService').resetData();
      this.send('closeSlideout');
    },

    // 3. close and do something
    batchImportContacts() {
      // sends contacts to backend then resets
      this.get('contactImportService').saveContacts();
      this.send('closeSlideout');
    },
  },
});
