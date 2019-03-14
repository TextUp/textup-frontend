import DS from 'ember-data';
import Shareable from 'textup-frontend/mixins/serializer/shareable';

export default DS.JSONSerializer.extend(Shareable);
