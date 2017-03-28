import Ember from 'ember';
import callIfPresent from '../utils/call-if-present';
import {
    compress
} from '../utils/photo';

const {
    isPresent,
    get,
    RSVP: {
        Promise
    }
} = Ember;

export default Ember.Mixin.create({

    setupController: function(controller) {
        this._super(...arguments);
        controller.set('isAddingNote', false);
        controller.set('isSavingNewNote', false);
    },

    actions: {
        initializeNewNote: function() {
            this.controller.set('recordNote', this.store.createRecord('record'));
        },
        cleanNoteSlideout: function() {
            const controller = this.controller,
                note = controller.get('recordNote'),
                itemToInsertAfter = controller.get('recordItemToInsertAfter');
            if (note) {
                note.set('isEditingNote', false);
            }
            if (itemToInsertAfter) {
                itemToInsertAfter.set('isAddingNoteAfter', false);
            }
            controller.set('recordNote', null);
            controller.set('recordItemToInsertAfter', null);
        },
        createNote: function(newNote, recipient, ...next) {
            const controller = this.controller,
                itemToInsertAfter = controller.get('recordItemToInsertAfter');
            if (itemToInsertAfter) {
                newNote.set('doAddAfterThis', itemToInsertAfter);
            }
            newNote.get('recipients').pushObject(recipient);
            controller.set('isSavingNewNote', true);
            return this._saveNote(newNote)
                .then(() => next.forEach(callIfPresent))
                .finally(() => controller.set('isSavingNewNote', false));
        },
        updateNote: function(note, ...next) {
            return this._saveNote(note).then(() => next.forEach(callIfPresent));
        },
        addLocationToNote: function(note) {
            note.set('location', this.store.createRecord('location'));
            note.set('shouldAddLocation', true);
        },
        removeLocationFromNote: function(note) {
            const loc = note.get('location.content');
            if (loc) {
                loc.rollbackAttributes();
            }
            note.set('location', null);
            note.set('shouldAddLocation', false);
        },
        addPhotoToNote: function(note, $img) {
            return new Promise((resolve, reject) => {
                compress($img[0]).then(([compressedImg, newMimeType]) => {
                    note.addImage(get(compressedImg, 'src'), newMimeType);
                    resolve();
                }, reject);
            });
        },
        removePhotoFromNote: function(note, imgSrc) {
            return new Promise((resolve) => {
                note.removeImage(imgSrc);
                resolve();
            });
        },
    },

    // Helpers
    // -------

    _saveNote: function(note) {
        return new Promise((resolve, reject) => {
            const isNewNote = note.get('isNew'),
                originalLocation = note.get('location.content'),
                originallyHasLocation = note.get('_originallyHasLocation');
            this.get('dataHandler')
                .persist(note)
                .then((success) => {
                    // if we are updating the location, then the updated note back
                    // will have a new location and this old location will be associated
                    // with a revision. We want the revision to show the original location
                    // not the un-saved updated values so we rollback attributes here
                    // EXCEPTION: if the note already has an existing location, then
                    // we don't want to rollback as doing so disrupts the association
                    // between the note and its newly created first location
                    if (!isNewNote && isPresent(originalLocation) && originallyHasLocation) {
                        originalLocation.rollbackAttributes();
                    }
                    const errors = note.get('uploadErrors');
                    // display errors if present
                    if (isPresent(errors)) {
                        errors.forEach((msg) => this.notifications.error(msg));
                    }
                    resolve(success);
                }, reject);
        });
    }
});