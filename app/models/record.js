import DS from 'ember-data';
import Ember from 'ember';
import NoteModel from '../mixins/note-model';
import md5 from 'npm:blueimp-md5';

// Cannot create polymorphic subclasses because
// we load records from the 'records' endpoint
const {
  get,
  isArray,
  isPresent,
  computed,
  computed: { equal: eq, notEmpty, sort, or },
  RSVP: { Promise }
} = Ember;

export default DS.Model.extend(NoteModel, {
  init() {
    this._super(...arguments);
    this._reset();
  },
  rollbackAttributes() {
    this._super(...arguments);
    this._reset();
  },
  _reset() {
    this._super(...arguments);

    this.setProperties({
      isAddingNoteAfter: false,
      shouldAddLocation: false,
      isEditingNote: false,
      doAddAfterThis: null,
      toggleNoteDeleteStatus: false,
      recipients: [],
      imagesToAdd: [],
      imagesToRemove: []
    });
    const originalImages = this.get('_originalImagesArray'),
      images = this.get('images');
    if (isArray(images) && isArray(originalImages)) {
      // want to preserve this existing array so we don't trigger Ember's built-in
      // dirty checking, which is only aware of objects but not object contents,
      // since we are manually managing state of the images array
      images.clear();
      images.pushObjects(originalImages);
      this.set('_originalImagesArray', null);
    }
  },

  // Events
  // ------

  didCreate() {
    // set fallback array to be null because, after the copy loaded from the server is pushed
    // into the store, the model is rolled back. If we don't set the fallback array to null
    // then the new copy from the server would be rolled back to what the images array was
    // before the new information from the server
    this.set('_originalImagesArray', null);
  },
  didUpdate() {
    // set fallback array to be null because, after the copy loaded from the server is pushed
    // into the store, the model is rolled back. If we don't set the fallback array to null
    // then the new copy from the server would be rolled back to what the images array was
    // before the new information from the server
    this.set('_originalImagesArray', null);
  },

  // Attributes
  // ----------

  whenCreated: DS.attr('date'),
  outgoing: DS.attr('boolean'),
  hasAwayMessage: DS.attr('boolean'),
  type: DS.attr('string'), // call | text | if null, then note

  authorName: DS.attr('string'),
  authorId: DS.attr('number'),
  authorType: DS.attr('string'),

  receipts: DS.hasMany('receipts'),
  // belong to either a contact or a tag
  contact: DS.belongsTo('contact'),
  tag: DS.belongsTo('tag'),

  // Call
  // ----

  durationInSeconds: DS.attr('number'),
  hasVoicemail: DS.attr('boolean'),

  // Call (voicemail)
  // ----------------

  voicemailUrl: DS.attr('string'),
  voicemailInSeconds: DS.attr('number'),
  callContents: DS.attr('string'),

  // Text
  // ----

  contents: DS.attr('string'),

  // Note
  // ----

  hasBeenDeleted: DS.attr('boolean'),
  isReadOnly: DS.attr('boolean'),
  unsortedRevisions: DS.hasMany('revision'),
  revisionsSorting: ['whenChanged:desc'],
  revisions: sort('unsortedRevisions', 'revisionsSorting'),
  // list of string error messages in the event that some of the images we are trying
  // to upload failed because of a specified error
  uploadErrors: DS.attr('collection'),
  // set by the serializer when it normalizing the incoming payload from the backend
  // to track whether or not we initially had a location as we can't get this information
  // from changedAttributes
  _originallyHasLocation: DS.attr('boolean'),

  // Not attributes
  // --------------

  recipients: null,
  // for any record item, true when we are trying to add a note after this item
  isAddingNoteAfter: false,
  // for note, true when should serialize with new
  shouldAddLocation: false,
  // for note, set to a record item that we should add this note after
  doAddAfterThis: null,
  // for note, set to true when editing to show an unbound version of the note in the record
  // so that we don't use too much bandwidth loading images and location previews when we
  // still are changing these values
  isEditingNote: false,
  // use this to toggle note's deletion status and in the serializer update
  // we do this to avoid triggering the rebuild on record-model mixin each time a note is
  // marked and un-marked for delete if we set the hasBeenDeleted attribute directly
  toggleNoteDeleteStatus: false,

  imagesToAdd: null,
  imagesToRemove: null,
  _originalImagesArray: null,

  // Computed properties
  // -------------------

  hasManualChanges: or(
    'hasRecipients',
    'location.content.isDirty',
    'toggleNoteDeleteStatus',
    'hasImagesToAdd',
    'hasImagesToRemove'
  ),
  isText: eq('type', 'TEXT'),
  isCall: eq('type', 'CALL'),

  hasRecipients: notEmpty('recipients'),
  hasRevisions: notEmpty('unsortedRevisions'),

  hasImagesToAdd: notEmpty('imagesToAdd'),
  hasImagesToRemove: notEmpty('imagesToRemove'),

  successes: computed('receipts.@each.status', function() {
    return DS.PromiseArray.create({
      promise: new Promise((resolve, reject) => {
        this.get('receipts').then(receipts => {
          resolve(receipts.filterBy('status', 'SUCCESS'));
        }, reject);
      })
    });
  }),
  numSuccesses: computed('successes.[]', function() {
    return DS.PromiseObject.create({
      promise: new Promise((resolve, reject) => {
        this.get('successes').then(successes => {
          resolve(successes.length);
        }, reject);
      })
    });
  }),

  // Methods
  // -------

  // store the original image source in its entirety on the addImage object so that we
  // can use the image source as a key to retrieve this addImage object, if it needs
  // to be removed later on
  addImage(imgSrc, mimeType) {
    this.tryStoreOriginalImages(); // store original images for rolling back before doing anything
    const toAdd = this.get('imagesToAdd'),
      toRemove = this.get('imagesToRemove'),
      imageList = this.get('images'),
      removedImage = toRemove.findBy('src', imgSrc),
      data = imgSrc.split(',')[1];
    toAdd.pushObject({
      // must be in format of a UploadItem (specified in API docs)
      mimeType,
      data,
      originalSrc: imgSrc,
      checksum: md5(data)
    });
    imageList.pushObject({
      key: imgSrc,
      link: imgSrc
    });
    if (isPresent(removedImage)) {
      toRemove.removeObject(removedImage);
    }
  },
  removeImage(imgSrc) {
    this.tryStoreOriginalImages(); // store original images for rolling back before doing anything
    const toRemove = this.get('imagesToRemove'),
      toAdd = this.get('imagesToAdd'),
      imageList = this.get('images'),
      image = imageList.findBy('link', imgSrc),
      addedImage = toAdd.findBy('originalSrc', imgSrc);
    if (isPresent(image)) {
      toRemove.pushObject({
        key: get(image, 'key'),
        src: imgSrc
      });
      imageList.removeObject(image);
    }
    if (isPresent(addedImage)) {
      toAdd.removeObject(addedImage);
    }
  },
  tryStoreOriginalImages() {
    const images = this.get('images');
    if (isArray(images) && !isPresent(this.get('_originalImagesArray'))) {
      // make a copy of the images array to preserve it for rolling back
      this.set('_originalImagesArray', [...images]);
    }
  }
});
