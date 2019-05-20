import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import Constants from 'textup-frontend/constants';
import { urlIdent } from 'textup-frontend/utils/property';

export default Mixin.create({
  [Constants.PROP_NAME.URL_IDENT]: computed(Constants.PROP_NAME.MODEL_NAME, 'id', function() {
    return urlIdent(this.get(Constants.PROP_NAME.MODEL_NAME), this.get('id'));
  }),
});
