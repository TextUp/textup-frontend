import DS from 'ember-data';
import HasAuthor from '../mixins/serializer/has-author';
import HasMedia from '../mixins/serializer/has-media';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, HasAuthor, HasMedia, {
  attrs: {
    location: { deserialize: 'records', serialize: false }
  }
});
