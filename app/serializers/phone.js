import DS from 'ember-data';
import HasMedia from 'textup-frontend/mixins/serializer/has-media';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, HasMedia, {
  attrs: {
    number: { serialize: false },
    tags: { deserialize: 'records', serialize: false },
    availability: { deserialize: 'records', serialize: 'records' },
    others: { deserialize: 'records', serialize: false },
    awayMessageMaxLength: { serialize: false }
  }
});
