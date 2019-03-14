import Ember from 'ember';
import { MODEL_NAME_PROP_NAME } from 'textup-frontend/utils/type';

const { computed } = Ember;

export const URL_IDENT_PROP_NAME = 'urlIdentifier';

export default Ember.Mixin.create({
  [URL_IDENT_PROP_NAME]: computed(MODEL_NAME_PROP_NAME, 'id', function() {
    return `${this.get(MODEL_NAME_PROP_NAME)}-${this.get('id')}`;
  }),
});
