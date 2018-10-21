import DS from 'ember-data';
import { MEDIA_ID_PROP_NAME } from 'textup-frontend/models/media';

export default DS.JSONSerializer.extend({
  attrs: {
    [MEDIA_ID_PROP_NAME]: { key: 'uid' },
    _versions: { key: 'versions' }
  }
});
