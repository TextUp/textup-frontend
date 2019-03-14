import DS from 'ember-data';
import HasAuthor from 'textup-frontend/mixins/serializer/has-author';
import HasMedia from 'textup-frontend/mixins/serializer/has-media';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, HasAuthor, HasMedia, {
  attrs: {
    location: { deserialize: 'records', serialize: false },
  },
});
