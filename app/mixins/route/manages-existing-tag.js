import Ember from 'ember';

export default Ember.Mixin.create({
  dataService: Ember.inject.service(),

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
        this.get('routeName'),
        this.get('constants.SLIDEOUT.OUTLET.DETAIL')
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
    }
  },

  _tryRollbackText() {
    const editingTag = this.get('controller.editingTag');
    if (editingTag) {
      editingTag.rollbackAttributes();
    }
  }
});
