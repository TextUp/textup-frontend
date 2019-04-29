import Constants from 'textup-frontend/constants';
import Dirtiable from 'textup-frontend/mixins/model/dirtiable';
import DS from 'ember-data';
import MF from 'model-fragments';

export default MF.Fragment.extend(Dirtiable, {
  [Constants.PROP_NAME.MEDIA_ID]: DS.attr('string'),
});
