import { readOnly } from '@ember/object/computed';
import { get, computed } from '@ember/object';
import { typeOf } from '@ember/utils';
import Constants from 'textup-frontend/constants';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import MF from 'ember-data-model-fragments';
import { ensureImageDimensions } from 'textup-frontend/utils/photo';

export default DS.Model.extend(Dirtiable, {
  // Properties
  // ----------

  images: MF.fragmentArray('media-element'),
  audio: MF.fragmentArray('media-element'),

  displayedImages: readOnly('_displayedImagesWithDimensions'),
  displayedAudio: readOnly('_displayedAudio'),
  pendingChanges: readOnly('_pendingChanges'),

  hasElements: readOnly('_hasElements'),
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
      height,
    });
    this.get('_imageAddChanges').pushObject(addObj);
    return addObj.get(Constants.PROP_NAME.MEDIA_ID);
  },
  addAudio(mimeType, mediaData) {
    if (typeOf(mimeType) !== 'string' || typeOf(mediaData) !== 'string') {
      return;
    }
    const addObj = this.get('store').createFragment('media/add', { mimeType, mediaData });
    this.get('_audioAddChanges').pushObject(addObj);
    return addObj.get(Constants.PROP_NAME.MEDIA_ID);
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
  },
});

export function mergeExistingAndChanges(existingElements, addChanges, removeChanges) {
  const displayedNew = addChanges.map(addChange => addChange.toMediaElement()),
    // after rolling back existing elements array may become undefined
    displayedExisting = (existingElements || []).filter(
      existing =>
        !removeChanges.findBy(
          Constants.PROP_NAME.MEDIA_ID,
          get(existing, Constants.PROP_NAME.MEDIA_ID)
        )
    );
  return [].addObjects(displayedNew).addObjects(displayedExisting);
}

export function removeElementsById(arrayToSearch, idVal) {
  const matching = arrayToSearch.findBy(Constants.PROP_NAME.MEDIA_ID, idVal);
  if (matching) {
    arrayToSearch.removeObject(matching);
    return true;
  } else {
    return false;
  }
}
