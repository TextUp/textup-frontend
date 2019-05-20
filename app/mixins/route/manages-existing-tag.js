import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import AppUtils from 'textup-frontend/utils/app';
import Constants from 'textup-frontend/constants';

export default Mixin.create({
  dataService: service(),

  setupController(controller) {
    this._super(...arguments);
    controller.setProperties({ editingTag: null });
  },

  actions: {
    startExistingTagSlideout() {
      this.get('controller').set('editingTag', this.get('currentModel'));
      this.send(
        'toggleSlideout',
        'slideouts/tag/edit',
        AppUtils.controllerNameForRoute(this),
        Constants.SLIDEOUT.OUTLET.DETAIL
      );
    },
    cancelExistingTagSlideout() {
      this.send('closeSlideout');
      this._tryRollbackText();
    },
    finishExistingTagSlideout() {
      return this.get('dataService')
        .persist(this.get('controller.editingTag'))
        .then(() => this.send('closeSlideout'));
    },

    onTagMarkForDelete() {
      const editingTag = this.get('controller.editingTag');
      if (editingTag) {
        editingTag.deleteRecord();
      }
    },
    onTagUndoDelete() {
      this._tryRollbackText();
    },
  },

  _tryRollbackText() {
    const editingTag = this.get('controller.editingTag');
    if (editingTag) {
      editingTag.rollbackAttributes();
    }
  },
});
