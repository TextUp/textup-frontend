import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import MF from 'model-fragments';
import { MEDIA_ID_PROP_NAME } from 'textup-frontend/models/media';

export default MF.Fragment.extend(Dirtiable, {
  [MEDIA_ID_PROP_NAME]: DS.attr('string')
});
