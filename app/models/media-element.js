import DS from 'ember-data';
import Ember from 'ember';
import MF from 'model-fragments';
import { MEDIA_ID_PROP_NAME } from 'textup-frontend/models/media';

const { computed, isPresent } = Ember;

export default MF.Fragment.extend({
  [MEDIA_ID_PROP_NAME]: DS.attr('string'),
  whenCreated: DS.attr('date', { defaultValue: () => new Date() }),
  versions: computed.readOnly('_versions'),

  isImage: computed('_versions.[]', function() {
    return this.get('_versions').any(vers => vers.get('type').includes('image'));
  }),
  isAudio: computed('_versions.[]', function() {
    return this.get('_versions').any(vers => vers.get('type').includes('audio'));
  }),

  // Private properties
  // ------------------

  _versions: MF.fragmentArray('media-element-version'),

  // Methods
  // -------
  addVersion(mimeType, rawSource, rawWidth = null, rawHeight = null) {
    const type = isPresent(mimeType) ? `${mimeType}` : null,
      source = isPresent(rawSource) ? `${rawSource}` : null,
      width = isNaN(parseInt(rawWidth)) ? null : parseInt(rawWidth),
      height = isNaN(parseInt(rawHeight)) ? null : parseInt(rawHeight);
    if (isPresent(type) && isPresent(source)) {
      this.get('_versions').createFragment({ type, source, width, height });
      return true;
    } else {
      return false;
    }
  }
});
