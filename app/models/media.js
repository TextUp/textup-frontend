import Dirtiable from '../mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import md5 from 'npm:blueimp-md5';

const { computed, get } = Ember,
  ACTIONS_ID_PROP_NAME = 'key',
  API_ID_PROP_NAME = 'uid',
  MediaImage = Ember.Object.extend({
    [API_ID_PROP_NAME]: null,
    small: computed(() => {
      return { source: null, width: null };
    }),
    medium: computed(() => {
      return { source: null, width: null };
    }),
    large: computed(() => {
      return { source: null, width: null };
    })
  }),
  AddChange = Ember.Object.extend({
    [ACTIONS_ID_PROP_NAME]: null,
    mimeType: null,
    data: null,
    toAction(constants) {
      const data = this.get('data');
      return {
        action: constants.ACTION.MEDIA.ADD,
        mimeType: this.get('mimeType'),
        data: data,
        checksum: md5(data)
      };
    }
  }),
  RemoveChange = Ember.Object.extend({
    [ACTIONS_ID_PROP_NAME]: null,
    toAction(constants) {
      return {
        action: constants.ACTION.MEDIA.REMOVE,
        [ACTIONS_ID_PROP_NAME]: this.get(ACTIONS_ID_PROP_NAME)
      };
    }
  });

export default DS.Model.extend(Dirtiable, {
  constants: Ember.inject.service(),

  // Overrides
  // ---------

  rollbackAttributes() {
    this._super(...arguments);
    this.get('_imagesToAdd').clear();
    this.get('_imagesToRemove').clear();
  },
  hasManualChanges: computed('pendingChanges.[]', function() {
    return this.get('pendingChanges.length') > 0;
  }),

  // Properties
  // ----------

  images: DS.attr('media-collection'),
  displayedImages: computed.readOnly('_displayedImages'),
  pendingChanges: computed.readOnly('_pendingChanges'),
  hasElements: computed.readOnly('_hasElements'),
  // list of string error messages in the event that some of the images we are trying
  // to upload failed because of a specified error
  uploadErrors: DS.attr('collection'),

  // Private properties
  // ------------------

  _displayedImages: computed('images.[]', '_imagesToAdd.[]', '_imagesToRemove.[]', function() {
    const displayedNew = this.get('_imagesToAdd').map(buildMediaImageForNew),
      imagesToExclude = this.get('_imagesToRemove'),
      // after rolling back `images` may become undefined
      displayedExisting = (this.get('images') || [])
        .filter(
          existing => !imagesToExclude.findBy(ACTIONS_ID_PROP_NAME, get(existing, API_ID_PROP_NAME))
        )
        .map(buildMediaImageForExisting);
    return [].addObjects(displayedNew).addObjects(displayedExisting);
  }),
  _pendingChanges: computed('_imagesToAdd.[]', '_imagesToRemove.[]', function() {
    const constants = this.get('constants'),
      addChanges = this.get('_imagesToAdd').map(toAdd => toAdd.toAction(constants)),
      removeChanges = this.get('_imagesToRemove').map(toAdd => toAdd.toAction(constants));
    return [].addObjects(addChanges).addObjects(removeChanges);
  }),
  _hasElements: computed('_displayedImages.[]', function() {
    return this.get('_displayedImages.length') > 0;
  }),
  _imagesToAdd: computed(() => []),
  _imagesToRemove: computed(() => []),

  // Methods
  // -------

  addChange(mimeType, data) {
    const addObj = AddChange.create({
        mimeType: mimeType,
        data: data
      }),
      tempId = Ember.guidFor(addObj);
    addObj.set(ACTIONS_ID_PROP_NAME, tempId);
    this.get('_imagesToAdd').pushObject(addObj);
    return tempId;
  },
  removeElement(elId) {
    const toAdd = this.get('_imagesToAdd'),
      matchingNewEl = toAdd.findBy(ACTIONS_ID_PROP_NAME, elId);
    if (matchingNewEl) {
      // if is new, then remove from new
      toAdd.removeObject(matchingNewEl);
    } else {
      const removeObj = RemoveChange.create({
        [ACTIONS_ID_PROP_NAME]: elId
      });
      // else add to the list of images to remove
      this.get('_imagesToRemove').pushObject(removeObj);
    }
  }
});

function buildMediaImageForNew(newImage) {
  return MediaImage.create({
    [API_ID_PROP_NAME]: get(newImage, ACTIONS_ID_PROP_NAME),
    large: {
      source: get(newImage, 'data'),
      width: null
    }
  });
}

function buildMediaImageForExisting(existingImage) {
  return MediaImage.create({
    [API_ID_PROP_NAME]: get(existingImage, API_ID_PROP_NAME),
    small: get(existingImage, 'small'),
    medium: get(existingImage, 'medium'),
    large: get(existingImage, 'large')
  });
}
