import Ember from 'ember';

export default Ember.Mixin.create({
  dataService: Ember.inject.service(),
  recordItemService: Ember.inject.service(),

  setupController(controller) {
    this._super(...arguments);
    controller.setProperties(this._initialRecordNoteProps());
  },

  actions: {
    onMarkNoteForDeletion(rNote) {
      rNote.set('hasBeenDeleted', true);
    },
    onRestoreNote(rNote) {
      rNote.set('hasBeenDeleted', false);
      this.get('dataService').persist(rNote);
    },

    onNoteAddImage() {
      return this.get('recordItemService').addImage(...arguments);
    },
    onNoteRemoveImage() {
      return this.get('recordItemService').removeImage(...arguments);
    },
    onNoteAddLocation(rNote) {
      return this.get('recordItemService').addLocationToNote(rNote);
    },
    onNoteRemoveLocation(rNote) {
      return this.get('recordItemService').removeLocationFromNote(rNote);
    },
    onLocationError() {
      return this.get('dataService').handleMapError();
    },

    startAddNoteSlideout(addAfterRecordItem = null) {
      const recipient = this.get('currentModel');
      this.get('controller').setProperties({
        newRecordNote: this.get('recordItemService').createNewNote(recipient, addAfterRecordItem)
      });
      this.send(
        'toggleSlideout',
        'slideouts/record-note/create',
        this.get('routeName'),
        this.get('constants.SLIDEOUT.OUTLET.DETAIL')
      );
    },
    cancelAddNoteSlideout() {
      this.send('closeSlideout');
      this._cleanAddNoteSlideout();
    },
    finishAddNoteSlideout() {
      return this.get('dataService')
        .persist(this.get('controller.newRecordNote'))
        .then(() => this.send('cancelAddNoteSlideout'));
    },

    startEditNoteSlideout(rNote) {
      this.get('controller').set('editingRecordNote', rNote);
      this.send(
        'toggleSlideout',
        'slideouts/record-note/edit',
        this.get('routeName'),
        this.get('constants.SLIDEOUT.OUTLET.DETAIL')
      );
    },
    cancelEditNoteSlideout() {
      this.send('closeSlideout');
      this._cleanEditNoteSlideout();
    },
    finishEditNoteSlideout() {
      const rNote = this.get('controller.editingRecordNote');
      return this.get('dataService')
        .persist(rNote)
        .then(() => this.send('cancelEditNoteSlideout'));
    },

    startViewNoteHistorySlideout(rNote) {
      this.get('controller').set('viewingRecordNote', rNote);
      this.send(
        'toggleSlideout',
        'slideouts/record-note/revisions',
        this.get('routeName'),
        this.get('constants.SLIDEOUT.OUTLET.DETAIL')
      );
    },
    finishViewNoteHistorySlideout() {
      this.send('closeSlideout');
      this.get('controller').setProperties(this._initialRecordNoteProps());
    }
  },

  _initialRecordNoteProps() {
    return { newRecordNote: null, editingRecordNote: null, viewingRecordNote: null };
  },
  _cleanAddNoteSlideout() {
    const controller = this.get('controller'),
      newRecordNote = controller.get('newRecordNote');
    controller.setProperties(this._initialRecordNoteProps());
    if (newRecordNote) {
      newRecordNote.rollbackAttributes();
    }
  },
  _cleanEditNoteSlideout() {
    const controller = this.get('controller'),
      editingRecordNote = controller.get('editingRecordNote');
    controller.setProperties(this._initialRecordNoteProps());
    if (editingRecordNote) {
      editingRecordNote.rollbackAttributes();
    }
  }
});
