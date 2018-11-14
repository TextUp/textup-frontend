import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import Ember from 'ember';
import md5 from 'npm:blueimp-md5';
import MF from 'model-fragments';
import { MEDIA_ID_PROP_NAME } from 'textup-frontend/models/media';

const { computed } = Ember;

export default MF.Fragment.extend(Dirtiable, {
  // Properties
  // ----------

  mediaData: null,
  mimeType: DS.attr('string'),
  width: null,
  height: null,

  checksum: computed('dataNoHeader', function() {
    const cleaned = this.get('dataNoHeader');
    return cleaned ? md5(cleaned) : '';
  }),
  dataNoHeader: computed('mediaData', function() {
    return (this.get('mediaData') || '').split(',')[1];
  }),
  [MEDIA_ID_PROP_NAME]: computed(function() {
    return Ember.guidFor(this);
  }),

  // Methods
  // -------

  toMediaElement() {
    const el = this.get('store').createFragment('media-element', {
      [MEDIA_ID_PROP_NAME]: this.get(MEDIA_ID_PROP_NAME)
    });
    el.addVersion(
      this.get('mimeType'),
      this.get('mediaData'),
      this.get('width'),
      this.get('height')
    );
    return el;
  }
});
