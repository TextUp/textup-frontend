import Ember from 'ember';
import moment from 'moment';

export default Ember.Mixin.create({
  recordItemService: Ember.inject.service(),

  setupController: function(controller) {
    this._super(...arguments);
    this._initializeProperties(controller);
  },

  actions: {
    startSingleExportSlideout(model) {
      this._initializeProperties(this.get('controller'), [model]);
      this.send(
        'toggleSlideout',
        'slideouts/export/single',
        this.get('routeName'),
        this.get('constants.SLIDEOUT.OUTLET.DETAIL')
      );
    },
    // TODO integrate
    startMultipleExportSlideout(selectedModels = []) {
      this._initializeProperties(this.get('controller'), selectedModels);
      this.send(
        'toggleSlideout',
        'slideouts/export/multiple',
        this.get('routeName'),
        this.get('constants.SLIDEOUT.OUTLET.DEFAULT')
      );
    },

    cancelExportSlideout() {
      this.send('closeSlideout');
    },
    finishExportSlideout() {
      const controller = this.get('controller'),
        dateStart = controller.get('exportStartDate'),
        dateEnd = controller.get('exportEndDate'),
        exportAsGrouped = controller.get('exportAsGrouped'),
        exportRecordOwners = controller.get('exportForEntirePhone')
          ? [] // pass no record owners if we want to export entire phone
          : controller.get('exportRecordOwners');
      return this.get('recordItemService')
        .exportRecordItems(dateStart, dateEnd, exportAsGrouped, exportRecordOwners)
        .then(() => this.send('closeSlideout'));
    },

    // TODO finish
    exportDoSearch() {},
    exportInsertRecordOwner() {},
    exportRemoveRecordOwner() {}
  },

  _initializeProperties(controller, models) {
    controller.setProperties({
      exportStartDate: moment()
        .subtract(7, 'days')
        .toDate(),
      exportEndDate: moment().toDate(),
      exportForEntirePhone: false,
      exportAsGrouped: false,
      exportRecordOwners: models
    });
  }
});
