import DS from 'ember-data';
import HasMedia from 'textup-frontend/mixins/serializer/has-media';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, HasMedia, {
  attrs: {
    awayMessageMaxLength: { serialize: false },
    isActive: { serialize: false },
    number: { serialize: false },
    tags: { deserialize: 'records', serialize: false },
  },
});
