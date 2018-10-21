import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import MF from 'model-fragments';
import { ensureImageDimensions } from 'textup-frontend/utils/photo';

const { computed, get, typeOf } = Ember;

export const MEDIA_ID_PROP_NAME = 'uid';

export default DS.Model.extend(Dirtiable, {
  // Properties
  // ----------

  images: MF.fragmentArray('media-element'),
  audio: MF.fragmentArray('media-element'),

  displayedImages: computed.readOnly('_displayedImagesWithDimensions'),
  displayedAudio: computed.readOnly('_displayedAudio'),
  pendingChanges: computed.readOnly('_pendingChanges'),

  hasElements: computed.readOnly('_hasElements'),
  // list of string error messages in the event that some of the images we are trying
  // to upload failed because of a specified error
  uploadErrors: MF.array('string'),

  // Private properties
  // ------------------

  _displayedImagesWithDimensions: computed('_displayedImages.[]', function() {
    return DS.PromiseArray.create({ promise: ensureImageDimensions(this.get('_displayedImages')) });
  }),
  _displayedImages: computed('images.[]', '_imageAddChanges.[]', '_removeChanges.[]', function() {
    return mergeExistingAndChanges(
      this.get('images'),
      this.get('_imageAddChanges'),
      this.get('_removeChanges')
    );
  }),
  _displayedAudio: computed('audio.[]', '_audioAddChanges.[]', '_removeChanges.[]', function() {
    return mergeExistingAndChanges(
      this.get('audio'),
      this.get('_audioAddChanges'),
      this.get('_removeChanges')
    );
  }),
  _hasElements: computed('_displayedImages.[]', '_displayedAudio.[]', function() {
    return this.get('_displayedImages.length') > 0 || this.get('_displayedAudio.length') > 0;
  }),

  _pendingChanges: computed(
    '_imageAddChanges.[]',
    '_audioAddChanges.[]',
    '_removeChanges.[]',
    function() {
      return []
        .addObjects(this.get('_imageAddChanges'))
        .addObjects(this.get('_audioAddChanges'))
        .addObjects(this.get('_removeChanges'));
    }
  ),
  _imageAddChanges: MF.fragmentArray('media/add'),
  _audioAddChanges: MF.fragmentArray('media/add'),
  _removeChanges: MF.fragmentArray('media/remove'),

  // Methods
  // -------

  addImage(mimeType, mediaData, rawWidth, rawHeight) {
    const width = parseInt(rawWidth),
      height = parseInt(rawHeight);
    if (
      typeOf(mimeType) !== 'string' ||
      typeOf(mediaData) !== 'string' ||
      isNaN(width) ||
      isNaN(height)
    ) {
      return;
    }
    const addObj = this.get('store').createFragment('media/add', {
      mimeType,
      mediaData,
      width,
      height
    });
    this.get('_imageAddChanges').pushObject(addObj);
    return addObj.get(MEDIA_ID_PROP_NAME);
  },
  addAudio(mimeType, mediaData) {
    if (typeOf(mimeType) !== 'string' || typeOf(mediaData) !== 'string') {
      return;
    }
    const addObj = this.get('store').createFragment('media/add', { mimeType, mediaData });
    this.get('_audioAddChanges').pushObject(addObj);
    return addObj.get(MEDIA_ID_PROP_NAME);
  },
  removeElement(elId) {
    if (typeOf(elId) !== 'string') {
      return false;
    }
    // if cannot remove from either new images or new audio, then add to list of elements to remove
    if (
      !removeElementsById(this.get('_imageAddChanges'), elId) &&
      !removeElementsById(this.get('_audioAddChanges'), elId)
    ) {
      this.get('_removeChanges').createFragment({ uid: elId });
    }
    return true;
  }
});

export function mergeExistingAndChanges(existingElements, addChanges, removeChanges) {
  const displayedNew = addChanges.map(addChange => addChange.toMediaElement()),
    // after rolling back existing elements array may become undefined
    displayedExisting = (existingElements || [])
      .filter(
        existing => !removeChanges.findBy(MEDIA_ID_PROP_NAME, get(existing, MEDIA_ID_PROP_NAME))
      );
  return [].addObjects(displayedNew).addObjects(displayedExisting);
}

export function removeElementsById(arrayToSearch, idVal) {
  const matching = arrayToSearch.findBy(MEDIA_ID_PROP_NAME, idVal);
  if (matching) {
    arrayToSearch.removeObject(matching);
    return true;
  } else {
    return false;
  }
}
