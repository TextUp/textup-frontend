import * as MediaActions from 'textup-frontend/objects/media-actions';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import { ACTIONS_ID_PROP_NAME } from 'textup-frontend/objects/media-actions';
import { API_ID_PROP_NAME } from 'textup-frontend/objects/media-image';
import { ensureImageDimensions } from 'textup-frontend/utils/photo';

const { computed, get, typeOf } = Ember;

export default DS.Model.extend(Dirtiable, {
  constants: Ember.inject.service(),

  // Overrides
  // ---------

  rollbackAttributes() {
    this._super(...arguments);
    this.get('_imageAddChanges').clear();
    this.get('_imageRemoveChanges').clear();
  },
  hasManualChanges: computed('pendingChanges.[]', function() {
    return this.get('pendingChanges.length') > 0;
  }),

  // Properties
  // ----------

  images: DS.attr('media-collection'),
  displayedImages: computed.readOnly('_displayedImagesWithDimensions'),
  pendingChanges: computed.readOnly('_pendingChanges'),
  hasElements: computed.readOnly('_hasElements'),
  // list of string error messages in the event that some of the images we are trying
  // to upload failed because of a specified error
  uploadErrors: DS.attr('collection'),

  // Private properties
  // ------------------

  _displayedImagesWithDimensions: computed('_displayedImages.[]', function() {
    return DS.PromiseArray.create({ promise: ensureImageDimensions(this.get('_displayedImages')) });
  }),
  _displayedImages: computed(
    'images.[]',
    '_imageAddChanges.[]',
    '_imageRemoveChanges.[]',
    function() {
      const displayedNew = this.get('_imageAddChanges').map(addChange => addChange.toMediaImage()),
        removeActions = this.get('_imageRemoveChanges'),
        // after rolling back `images` may become undefined
        // because of transform, images is already an array of `MediaImage`s
        displayedExisting = (this.get('images') || [])
          .filter(
            existing => !removeActions.findBy(ACTIONS_ID_PROP_NAME, get(existing, API_ID_PROP_NAME))
          );
      return [].addObjects(displayedNew).addObjects(displayedExisting);
    }
  ),
  _pendingChanges: computed('_imageAddChanges.[]', '_imageRemoveChanges.[]', function() {
    const constants = this.get('constants'),
      addChanges = this.get('_imageAddChanges').map(toAdd => toAdd.toAction(constants)),
      removeChanges = this.get('_imageRemoveChanges').map(toAdd => toAdd.toAction(constants));
    return [].addObjects(addChanges).addObjects(removeChanges);
  }),
  _hasElements: computed('_displayedImages.[]', function() {
    return this.get('_displayedImages.length') > 0;
  }),
  _imageAddChanges: computed(() => []),
  _imageRemoveChanges: computed(() => []),

  // Methods
  // -------

  addChange(mimeType, data, rawWidth, rawHeight) {
    const width = parseInt(rawWidth),
      height = parseInt(rawHeight);
    if (
      typeOf(mimeType) !== 'string' ||
      typeOf(data) !== 'string' ||
      isNaN(width) ||
      isNaN(height)
    ) {
      return;
    }
    const addObj = MediaActions.AddChange.create({ mimeType, data, width, height }),
      tempId = Ember.guidFor(addObj);
    addObj.set(ACTIONS_ID_PROP_NAME, tempId);
    this.get('_imageAddChanges').pushObject(addObj);
    return tempId;
  },
  removeElement(elId) {
    if (typeOf(elId) !== 'string') {
      return false;
    }
    const toAdd = this.get('_imageAddChanges'),
      matchingNewEl = toAdd.findBy(ACTIONS_ID_PROP_NAME, elId);
    if (matchingNewEl) {
      // if is new, then remove from; new
      toAdd.removeObject(matchingNewEl);
    } else {
      const removeObj = MediaActions.RemoveChange.create({ [ACTIONS_ID_PROP_NAME]: elId });
      // else add to the list of images to remove
      this.get('_imageRemoveChanges').pushObject(removeObj);
    }
    return true;
  }
});
