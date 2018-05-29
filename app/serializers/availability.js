import DS from 'ember-data';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
    name: {
      serialize: false
    },
    isAvailableNow: {
      serialize: false
    },
    schedule: {
      deserialize: 'records',
      serialize: 'records'
    }
  }
});
