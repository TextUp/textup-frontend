import Constants from 'textup-frontend/constants';
import Ember from 'ember';

const { computed } = Ember;

export default Ember.Mixin.create({
  [Constants.PROP_NAME.URL_IDENT]: computed(Constants.PROP_NAME.MODEL_NAME, 'id', function() {
    return `${this.get(Constants.PROP_NAME.MODEL_NAME)}-${this.get('id')}`;
  }),
});
